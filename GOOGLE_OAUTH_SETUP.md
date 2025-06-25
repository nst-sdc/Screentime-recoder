# Google OAuth Integration Setup Guide

This guide will help you set up Google OAuth authentication for your Screentime Recorder application.

## Quick Start

### 1. Google Cloud Console Setup

1. **Create a Google Cloud Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one

2. **Enable Google+ API**

   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "People API" for profile information

3. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`

4. **Get Your Credentials**
   - Copy the Client ID and Client Secret from the credentials page

### 2. Environment Configuration

#### Backend (.env)

```bash
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your_session_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

#### Frontend (client/.env)

```bash
VITE_API_URL=http://localhost:3000/api
```

### 3. Run the Application

1. **Start the Backend**:

   ```bash
   npm start
   ```

2. **Start the Frontend** (in a new terminal):

   ```bash
   cd client
   npm run dev
   ```

3. **Visit** `http://localhost:5173` and click "Continue with Google"

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Express Session Configuration](https://github.com/expressjs/session#readme)
