const Investment = require('../models/Investment');

exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id }).sort('-createdAt');
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const totalCurrentValue = investments.reduce((s, i) => s + (i.currentValue || i.investedAmount), 0);
    res.json({ success: true, investments, summary: { totalInvested, totalCurrentValue, gain: totalCurrentValue - totalInvested, gainPercent: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested * 100).toFixed(2) : 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addInvestment = async (req, res) => {
  try {
    const investment = await Investment.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, investment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, investment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInvestment = async (req, res) => {
  try {
    await Investment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true, message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPortfolioSummary = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id });
    const byType = investments.reduce((acc, inv) => {
      if (!acc[inv.type]) acc[inv.type] = { invested: 0, current: 0 };
      acc[inv.type].invested += inv.investedAmount;
      acc[inv.type].current += inv.currentValue || inv.investedAmount;
      return acc;
    }, {});
    const sipInvestments = investments.filter(i => i.isSIP);
    const totalSIPMonthly = sipInvestments.reduce((s, i) => s + (i.sipAmount || 0), 0);
    res.json({ success: true, byType, totalSIPMonthly, investments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Live market data via Yahoo Finance v8 API (no API key needed) ---
const fetchYahooQuote = async (symbol) => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const change = price && prevClose ? ((price - prevClose) / prevClose * 100) : null;
    return {
      price: price ? Math.round(price * 100) / 100 : null,
      change: change !== null ? (change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`) : null,
      isLive: true
    };
  } catch {
    return null;
  }
};

// Cache to avoid hammering Yahoo Finance on every request (5 min TTL)
let watchlistCache = null;
let watchlistCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

exports.getMarketWatchlist = async (req, res) => {
  const STOCKS = [
    { symbol: 'RELIANCE.NS', displaySymbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Conglomerate', risk: 'Medium', suggestion: 'Research Worthy' },
    { symbol: 'TCS.NS',      displaySymbol: 'TCS',      name: 'Tata Consultancy Services', sector: 'IT', risk: 'Low', suggestion: 'Stable Pick' },
    { symbol: 'HDFCBANK.NS', displaySymbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', risk: 'Low', suggestion: 'Bluechip' },
    { symbol: 'INFY.NS',     displaySymbol: 'INFY',     name: 'Infosys', sector: 'IT', risk: 'Low', suggestion: 'Research Worthy' },
    { symbol: 'BAJFINANCE.NS', displaySymbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'NBFC', risk: 'Medium', suggestion: 'Growth Stock' },
    { symbol: '^NSEI',       displaySymbol: 'NIFTY 50', name: 'Nifty 50 Index', sector: 'Index', risk: 'Low', suggestion: 'Beginner Friendly' },
    { symbol: 'GOLDBEES.NS', displaySymbol: 'GOLDBEES', name: 'Nippon Gold ETF', sector: 'Commodity', risk: 'Low', suggestion: 'Hedge Asset' },
  ];

  const sipSuggestions = [
    { name: 'Axis Bluechip Fund', type: 'Large Cap', minSIP: 500, risk: 'Low', returns: '12-15%' },
    { name: 'Mirae Asset Emerging Bluechip', type: 'Large & Mid Cap', minSIP: 1000, risk: 'Medium', returns: '15-18%' },
    { name: 'Parag Parikh Flexi Cap', type: 'Flexi Cap', minSIP: 1000, risk: 'Medium', returns: '14-17%' },
    { name: 'SBI Small Cap Fund', type: 'Small Cap', minSIP: 500, risk: 'High', returns: '18-22%' },
  ];

  // Serve from cache if fresh
  if (watchlistCache && Date.now() - watchlistCacheTime < CACHE_TTL) {
    return res.json({ success: true, watchlist: watchlistCache, sipSuggestions, dataSource: 'cache' });
  }

  try {
    // Fetch all quotes in parallel
    const quotes = await Promise.all(STOCKS.map(s => fetchYahooQuote(s.symbol)));

    const watchlist = STOCKS.map((stock, i) => {
      const quote = quotes[i];
      return {
        symbol: stock.displaySymbol,
        name: stock.name,
        sector: stock.sector,
        risk: stock.risk,
        suggestion: stock.suggestion,
        change: quote?.change || 'N/A',
        price: quote?.price || null,
        isLive: quote?.isLive || false,
      };
    });

    watchlistCache = watchlist;
    watchlistCacheTime = Date.now();

    res.json({ success: true, watchlist, sipSuggestions, dataSource: 'live', lastUpdated: new Date().toISOString() });
  } catch (error) {
    // Fallback to static data if live fetch fails
    const fallback = STOCKS.map(s => ({
      symbol: s.displaySymbol, name: s.name, sector: s.sector,
      risk: s.risk, suggestion: s.suggestion, change: 'N/A', isLive: false
    }));
    res.json({ success: true, watchlist: fallback, sipSuggestions, dataSource: 'fallback' });
  }
};
