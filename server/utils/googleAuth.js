const { OAuth2Client } = require('google-auth-library');

const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'your_google_client_id') {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID in server/.env');
  }
  return new OAuth2Client(clientId, process.env.GOOGLE_CLIENT_SECRET);
};

exports.verifyGoogleAccessToken = async (accessToken) => {
  const client = getOAuthClient();
  const tokenInfo = await client.getTokenInfo(accessToken);

  if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Invalid Google token');
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    throw new Error('Failed to fetch Google profile');
  }

  const profile = await profileRes.json();

  if (!profile.sub || !profile.email) {
    throw new Error('Google profile missing required fields');
  }

  return {
    googleId: profile.sub,
    email: profile.email,
    name: profile.name || profile.email.split('@')[0],
    avatar: profile.picture || '',
  };
};
