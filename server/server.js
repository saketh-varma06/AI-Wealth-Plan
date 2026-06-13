require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
connectDB();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many auth attempts, please try again later.' } });
app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/investments', require('./routes/investments'));

const { notifRouter, reportRouter, adminRouter } = require('./routes/misc');
app.use('/api/notifications', notifRouter);
app.use('/api/reports', reportRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'AI Wealth Planner API running', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));

module.exports = app;
