# Google Sign-In Setup

Google authentication is built in. After you add credentials, sign-in works on **Login** and **Register**.

## 1. Create Google OAuth credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Go to **APIs & Services → OAuth consent screen** and configure it (External is fine for development)
4. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**
5. Application type: **Web application**
6. **Authorized JavaScript origins** (required):
   - `http://localhost:5173`
7. Save and copy the **Client ID** and **Client secret**

## 2. Add credentials to `.env` files

**`client/.env`**

```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

**`server/.env`**

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

Use the **same Client ID** in both files.

## 3. Restart the app

```bash
# Terminal 1 — server
cd server
npm install
npm run dev

# Terminal 2 — client
cd client
npm install
npm run dev
```

Open http://localhost:5173/login and click **Continue with Google**.

## How it works

1. User clicks the Google button → Google popup opens
2. Client receives an access token from Google
3. Client sends the token to `POST /api/auth/google`
4. Server verifies the token with Google and creates or links the user
5. Server returns a JWT; user is redirected to onboarding or dashboard

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Google sign-in is not configured" | Set `VITE_GOOGLE_CLIENT_ID` in `client/.env` and restart Vite |
| "Google OAuth is not configured" | Set `GOOGLE_CLIENT_ID` in `server/.env` and restart the server |
| `redirect_uri_mismatch` or origin error | Add `http://localhost:5173` under Authorized JavaScript origins |
| Popup blocked | Allow popups for localhost in your browser |
| Button works but API fails | Ensure MongoDB is running and `MONGODB_URI` is correct |
