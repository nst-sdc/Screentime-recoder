# Dual Authentication System Setup Guide

This application now supports both **Google OAuth** and **Local Email/Password** authentication, giving users maximum flexibility in how they want to sign in.

## Features

### Authentication Methods

- **Google OAuth 2.0** - Sign in with Google account
- **Local Registration** - Create account with email/password
- **Local Login** - Sign in with email/password
- **Hybrid Support** - Users can link Google to existing local accounts

### Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure token-based authentication
- **Session Management** - Express sessions for OAuth flow
- **Email Validation** - Email format validation
- **Password Strength** - Minimum 6 characters required

## 🛠 Setup Instructions

### 1. Backend Configuration

#### Install Dependencies

```bash
npm install passport passport-google-oauth20 express-session bcryptjs jsonwebtoken jwks-rsa cors
```

#### Environment Variables (.env)

```bash
# Database
MONGO_URI=your_mongodb_connection_string

# Server Configuration
PORT=3000
CLIENT_URL=http://localhost:5174
SESSION_SECRET=your_session_secret_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 2. Frontend Configuration

#### Environment Variables (client/.env)

```bash
VITE_API_URL=http://localhost:3000/api
```

### 3. Google Cloud Console Setup (Optional)

Only needed if you want Google OAuth:

1. **Create Project** in [Google Cloud Console](https://console.cloud.google.com)
2. **Enable APIs**: Google+ API and People API
3. **Create OAuth 2.0 Credentials**:
   - Authorized origins: `http://localhost:3000`
   - Redirect URIs: `http://localhost:3000/api/auth/google/callback`

## API Endpoints

### Local Authentication

- `POST /api/auth/register` - Register new user

  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login with credentials
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Google OAuth

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle OAuth callback

### Protected Routes

- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account
- `POST /api/auth/logout` - Logout

### Account Linking

- If user registers locally then later tries Google OAuth with same email, accounts are automatically linked
- User can then use either method to log in

## Development

### Start the Application

```bash
# Terminal 1: Backend
npm start

# Terminal 2: Frontend
cd client && npm run dev
```

### Test Authentication

1. **Local Registration**: Visit `http://localhost:5174/register`
2. **Local Login**: Visit `http://localhost:5174/login`
3. **Google OAuth**: Click Google buttons on login/register pages
4. **Protected Routes**: Access dashboard after authentication

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3000
CLIENT_URL=https://yourdomain.com
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

## 📚 Advanced Features (Future Enhancements)

- [ ] Email verification for local accounts
- [ ] Password reset functionality
- [ ] Social login with other providers (Facebook, Twitter)
- [ ] Two-factor authentication (2FA)
- [ ] Account merging interface
- [ ] Login history and device management
- [ ] Rate limiting and brute force protection
- [ ] OAuth scope customization

## Current Status

✅ **Fully Functional Dual Authentication System**

- Local email/password registration and login
- Google OAuth integration
- Automatic account linking
- JWT-based API authentication
- Protected routes and components
- Error handling and validation
- Secure password hashing
- Session management
