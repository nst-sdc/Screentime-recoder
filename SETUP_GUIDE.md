# 🛠️ Complete Setup Guide - Screen Time Recorder

This comprehensive guide will walk you through setting up the Screen Time Recorder application from scratch, including all dependencies, configurations, and deployment options.

## 📋 Table of Contents

- [System Requirements](#-system-requirements)
- [Development Environment Setup](#-development-environment-setup)
- [Database Configuration](#-database-configuration)
- [Authentication Setup](#-authentication-setup)
- [AI Integration Setup](#-ai-integration-setup)
- [Chrome Extension Setup](#-chrome-extension-setup)
- [Production Deployment](#-production-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 💻 System Requirements

### Minimum Requirements
- **Operating System**: Windows 10, macOS 10.15, or Ubuntu 18.04+
- **Node.js**: v18.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Browser**: Chrome 88+ (for extension development)

### Recommended Development Tools
- **Code Editor**: VS Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Thunder Client (for API testing)
- **Database GUI**: MongoDB Compass
- **Git Client**: GitHub Desktop or command line

---

## 🔧 Development Environment Setup

### Step 1: Install Node.js and npm

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

#### macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install Git

#### Windows
Download from [git-scm.com](https://git-scm.com/) and run the installer.

#### macOS
```bash
# Using Homebrew
brew install git

# Or use Xcode Command Line Tools
xcode-select --install
```

#### Linux
```bash
sudo apt-get update
sudo apt-get install git
```

### Step 3: Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/nst-sdc/Screentime-recoder.git
cd Screentime-recoder

# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

---

## 🗄️ Database Configuration

### Option 1: Local MongoDB Installation

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and choose "Complete" setup
3. Install MongoDB Compass (GUI tool)
4. Start MongoDB service:
   ```cmd
   net start MongoDB
   ```

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

#### Linux
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account**: Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: 
   - Choose "Shared" for free tier
   - Select your preferred cloud provider and region
   - Create cluster (takes 1-3 minutes)
3. **Configure Access**:
   - Add your IP address to IP Access List
   - Create database user with read/write permissions
4. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Database Setup Verification

```bash
# Test local MongoDB connection
mongosh

# Or test with Node.js
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));
"
```

---

## 🔐 Authentication Setup

### JWT Configuration

1. **Generate JWT Secret**:
   ```bash
   # Generate a secure random string
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Update Environment Variables**:
   ```env
   JWT_SECRET=your_generated_jwt_secret_here
   JWT_EXPIRES_IN=7d
   SESSION_SECRET=your_session_secret_here
   ```

### Google OAuth Setup (Optional)

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one
   - Enable Google+ API

2. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in application details:
     - App name: "Screen Time Recorder"
     - User support email: your email
     - Developer contact: your email

3. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://your-domain.com/api/auth/google/callback` (production)

4. **Update Environment Variables**:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   ```

---

## 🤖 AI Integration Setup

### Google Gemini AI Setup

1. **Get API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create new API key
   - Copy the generated key

2. **Update Environment Variables**:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Test AI Integration**:
   ```bash
   # Test API key
   curl -H "Content-Type: application/json" \
        -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
        -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
   ```

---

## 🌐 Chrome Extension Setup

### Development Setup

1. **Navigate to Extension Directory**:
   ```bash
   cd extension
   ```

2. **Update Configuration**:
   Edit `manifest.json` for development:
   ```json
   {
     "host_permissions": [
       "http://localhost:3000/*"
     ],
     "externally_connectable": {
       "matches": ["http://localhost:5173/*"]
     }
   }
   ```

3. **Load Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `extension` folder
   - Extension should appear in your extensions list

4. **Test Extension**:
   - Click the extension icon in Chrome toolbar
   - Check if popup opens correctly
   - Verify background script is running (check service worker)

### Extension Development Workflow

```bash
# Make changes to extension files
# Then reload extension:
# 1. Go to chrome://extensions/
# 2. Click reload button on your extension
# 3. Test changes
```

---

## 🚀 Production Deployment

### Backend Deployment (Render)

1. **Prepare for Deployment**:
   ```bash
   # Ensure all dependencies are in package.json
   cd server
   npm install --production
   ```

2. **Create Render Account**:
   - Sign up at [render.com](https://render.com/)
   - Connect your GitHub account

3. **Deploy Backend**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: screentime-recorder-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

4. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_production_jwt_secret
   SESSION_SECRET=your_production_session_secret
   CLIENT_URL=https://your-frontend-domain.vercel.app
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://your-backend-domain.onrender.com/api/auth/google/callback
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Frontend Deployment (Vercel)

1. **Prepare Frontend**:
   ```bash
   cd client
   
   # Create production environment file
   echo "VITE_API_URL=https://your-backend-domain.onrender.com" > .env.production
   
   # Test production build
   npm run build
   npm run preview
   ```

2. **Deploy to Vercel**:
   - Sign up at [vercel.com](https://vercel.com/)
   - Connect GitHub account
   - Import your repository
   - Configure settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Set Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-domain.onrender.com
   ```

### Chrome Extension Production

1. **Update Manifest for Production**:
   ```json
   {
     "host_permissions": [
       "https://your-backend-domain.onrender.com/*"
     ],
     "externally_connectable": {
       "matches": ["https://your-frontend-domain.vercel.app/*"]
     }
   }
   ```

2. **Create Extension Package**:
   ```bash
   cd extension
   zip -r screentime-recorder-extension.zip . -x "*.DS_Store" "node_modules/*"
   ```

3. **Publish to Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay one-time $5 registration fee
   - Upload your extension package
   - Fill in store listing details
   - Submit for review

---

## 🔧 Environment Configuration

### Complete .env File Template

```env
# ======================
# DEVELOPMENT SETTINGS
# ======================
NODE_ENV=development
PORT=3000

# ======================
# DATABASE CONFIGURATION
# ======================
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/screentime-recorder

# MongoDB Atlas (alternative)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/screentime-recorder

# ======================
# APPLICATION URLS
# ======================
CLIENT_URL=http://localhost:5173

# ======================
# AUTHENTICATION
# ======================
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret_here

# ======================
# GOOGLE OAUTH (OPTIONAL)
# ======================
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# ======================
# AI INTEGRATION (OPTIONAL)
# ======================
GEMINI_API_KEY=your_gemini_api_key_here

# ======================
# PRODUCTION OVERRIDES
# ======================
# Uncomment and modify for production:
# NODE_ENV=production
# CLIENT_URL=https://your-frontend-domain.com
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/screentime-recorder
# GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
```

---

## 🧪 Testing Setup

### Run Test Suite

```bash
# Install test dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch

# Run specific test categories
npm test -- --testPathPattern="unit"
npm test -- --testPathPattern="integration"
```

### Test Environment Configuration

The project includes a separate test environment configuration in `.env.test`:

```env
NODE_ENV=test
PORT=3001
SESSION_SECRET=test_session_secret
JWT_SECRET=test_jwt_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=test_client_id
GOOGLE_CLIENT_SECRET=test_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
GEMINI_API_KEY=test_gemini_key
```

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Issues

**Problem**: `MongoNetworkError: failed to connect to server`

**Solutions**:
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# macOS:
brew services start mongodb/brew/mongodb-community

# Linux:
sudo systemctl start mongod

# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"
```

#### 2. Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# macOS/Linux:
lsof -ti:3000

# Kill the process
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>
```

#### 3. npm Install Failures

**Problem**: Package installation fails

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use different registry if needed
npm install --registry https://registry.npmjs.org/
```

#### 4. Chrome Extension Not Loading

**Problem**: Extension doesn't appear or work correctly

**Solutions**:
1. Check manifest.json syntax with JSON validator
2. Verify all file paths in manifest are correct
3. Check Chrome DevTools for extension errors:
   - Go to `chrome://extensions/`
   - Click "Errors" button on your extension
4. Ensure all permissions are granted

#### 5. CORS Issues

**Problem**: `Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solutions**:
1. Verify CORS configuration in server.js:
   ```javascript
   const allowedOrigins = [
     "http://localhost:5173",
     "http://localhost:3000",
     process.env.CLIENT_URL
   ].filter(Boolean);
   ```

2. Check environment variables are set correctly
3. Restart both frontend and backend servers

#### 6. JWT Token Issues

**Problem**: Authentication fails or tokens are invalid

**Solutions**:
1. Verify JWT_SECRET is set in environment variables
2. Check token expiration settings
3. Clear browser localStorage/cookies
4. Regenerate JWT secret if needed

#### 7. Google OAuth Issues

**Problem**: OAuth authentication fails

**Solutions**:
1. Verify Google Cloud Console configuration
2. Check redirect URIs match exactly
3. Ensure OAuth consent screen is configured
4. Verify client ID and secret in environment variables

---

## 📚 Additional Resources

### Documentation Links
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [React Documentation](https://reactjs.org/docs/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

### Useful Commands Reference

```bash
# Project Management
npm run dev          # Start development servers
npm test            # Run test suite
npm run build       # Build for production

# Database Operations
mongosh                              # Connect to MongoDB
mongosh "mongodb://localhost:27017"  # Connect with connection string
db.users.find()                     # Query users collection
db.activities.countDocuments()       # Count activities

# Git Operations
git status                    # Check repository status
git add .                    # Stage all changes
git commit -m "message"      # Commit changes
git push origin main         # Push to remote repository

# Chrome Extension Development
chrome://extensions/         # Extension management page
chrome://inspect/#service-workers  # Debug service workers
```

---

## ✅ Setup Verification Checklist

Use this checklist to verify your setup is complete:

### Development Environment
- [ ] Node.js v18+ installed and verified
- [ ] Git installed and configured
- [ ] Project cloned and dependencies installed
- [ ] Code editor set up with recommended extensions

### Database
- [ ] MongoDB installed locally OR Atlas cluster created
- [ ] Database connection string configured in .env
- [ ] Connection tested successfully

### Authentication
- [ ] JWT secret generated and configured
- [ ] Google OAuth credentials created (if using)
- [ ] Environment variables set correctly

### Application
- [ ] Backend server starts without errors (port 3000)
- [ ] Frontend server starts without errors (port 5173)
- [ ] API health check returns success
- [ ] Test suite runs successfully

### Chrome Extension
- [ ] Extension loaded in Chrome developer mode
- [ ] Extension popup opens correctly
- [ ] Background script running without errors
- [ ] Extension can communicate with backend

### Production (if deploying)
- [ ] Backend deployed to Render/similar service
- [ ] Frontend deployed to Vercel/similar service
- [ ] Production environment variables configured
- [ ] HTTPS certificates configured
- [ ] Domain names configured correctly

---

**🎉 Congratulations!** If you've completed this setup guide, you now have a fully functional Screen Time Recorder application ready for development or production use.

For additional help, please check our [GitHub Issues](https://github.com/nst-sdc/Screentime-recoder/issues) or create a new issue if you encounter problems not covered in this guide.
