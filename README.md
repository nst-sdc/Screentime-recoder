# 📚 Screen Time Recorder

---

### 🧠 Project Overview

The **Screen Time Recorder** helps users track and improve their actual study time by analysing screen content. The app runs in the background and uses AI to detect focus, identify difficult topics, and provide contextual support to help users study more effectively.

---

### 🎯 Objectives

- To help users develop awareness of their digital habits through meaningful data.
- To provide a privacy-focused screen time tracking tool that respects user control.
- To deliver visual insights into productivity, patterns, and activity without manual input.
- To integrate seamlessly with a browser extension that tracks sessions automatically in the background.

---

### 🏗️ Features

- **🔐 Secure Dashboard**

* Authenticated access using Google OAuth.
* Personalized view for each user’s activity.

- **🧾 Productivity Metrics**
  Productivity score (0–10) with average calculation.
  Productive vs unproductive time tracked for the selected week.

- **📊 Visual Reports**
  Pie Chart & Bar Chart to break down activity by category.
  Productivity Trends Line Graph showing duration vs productivity over time.

- **🗂️ Activity Hierarchy**
  Interactive Sunburst Chart visualizing:
  Inner ring: Activity categories
  Outer ring: Specific domains

- **📆 Activity Heatmap**
  Hour-by-hour usage mapping throughout the week.
  Highlights peak hours and low-activity slots.

- **🧠 Behavioral Insights**
  Peak active hours and most productive days.
  Checks Consistency score
  Detected usage pattern (e.g., "Flexible Schedule").

- **🔍 Recent Activity Summary**
  Tabular view of recent activities.
  Filters by category, productivity level, and duration.
  Shows domain name, session count, and timestamps.

- **🌐 Browser Extension Integration**
  Captures tab activity automatically from extension.
  Sends data to backend every 30 seconds.
  Accurate tracking with start/end time of each session.

---

### 🔧 Tech Stack

| Layer          | Tech                                |
| -------------- | ----------------------------------- |
| Frontend       | React.js + Vite                     |
| Backend        | Node.js + Express                   |
| Database       | MongoDB                             |
| Authentication | JWT + Google OAuth                  |
| Visualization  | D3.js                               |
| Extension      | Chrome Extension (Manifest V3)      |
| Deployment     | Vercel (frontend), Render (backend) |

---

### 🔐 Authentication

- JSON Web Tokens (JWT) + Google OAuth
- User sessions for tracking and saving focus data
- Secure password hashing and session management
- Role-based support planned for future (students/admins)

---

### 📁 Project Structure

```shell
screentime-recorder/
├── client/                     # React Frontend (Vite)
├── server/                     # Node.js Backend (Express)
├── extension/                  # Chrome Extension (Manifest V3)
├── .env.example                # Environment variables template
├── README.md                   # Project documentation
├── package.json                # Root package configuration
└── LICENSE                     # License information
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **MongoDB** (v5.0 or higher) - [Installation Guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download here](https://git-scm.com/)
- **Google Chrome** (for browser extension)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/screentime-recoder.git
   cd screentime-recoder
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   **Backend Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```bash
   # Database
   MONGO_URI=mongodb://localhost:27017/screentime-recorder
   
   # Server Configuration
   PORT=3000
   CLIENT_URL=http://localhost:5173
   SESSION_SECRET=your-super-secret-session-key-here
   
   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key-here
   JWT_EXPIRES_IN=7d
   
   # Google OAuth (Required for authentication)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   
   # Gemini AI Configuration (Optional - for AI categorization)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Frontend Configuration:**
   ```bash
   cd client
   cp .env.example .env
   ```
   
   Edit `client/.env`:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_ENV=development
   ```

5. **Set up Google OAuth** (Required)
   
   Follow the detailed guide in [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) to:
   - Create a Google Cloud Project
   - Enable necessary APIs (Google+ API, People API)
   - Generate OAuth credentials
   - Configure authorized origins and redirect URIs

6. **Start MongoDB**
   ```bash
   # Using MongoDB service (macOS/Linux)
   sudo systemctl start mongod
   
   # Or using MongoDB directly
   mongod --dbpath /path/to/your/db
   
   # For macOS with Homebrew
   brew services start mongodb-community
   ```

7. **Start the application**
   
   **Option A: Start backend only**
   ```bash
   # From root directory
   npm start          # Production mode
   npm run dev        # Development mode with nodemon
   ```
   
   **Option B: Start frontend separately**
   ```bash
   # In a new terminal
   cd client
   npm run dev        # Development server
   npm run build      # Build for production
   npm run preview    # Preview production build
   ```

8. **Install Browser Extension**
   
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `extension/` folder
   - The extension icon should appear in your browser toolbar
   - Pin the extension for easy access

### 🌐 Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

---

## 📖 Usage Guide

### First-Time Setup

1. **Start the application** following the installation steps above
2. **Navigate** to http://localhost:5173
3. **Sign in** using Google OAuth
4. **Install the browser extension** and grant necessary permissions
5. **Start browsing** - the extension will automatically track your activity

### Browser Extension Usage

The extension automatically:
- **Tracks active tabs** and time spent on each domain
- **Categorizes websites** using AI (if Gemini API is configured)
- **Sends data** to the backend every 30 seconds
- **Respects privacy** - only domain names and time data are collected

### Dashboard Features

#### 📊 Analytics Dashboard
- **Productivity Score:** View your overall productivity rating (0-10)
- **Time Distribution:** See how time is split between productive/unproductive activities
- **Category Breakdown:** Pie charts showing activity distribution
- **Trends:** Line graphs showing productivity patterns over time

#### 📅 Activity Heatmap
- **Hourly Usage:** Visual representation of activity throughout the day
- **Weekly Patterns:** Identify your most and least active periods
- **Peak Hours:** Discover when you're most productive

#### 🎯 Behavioral Insights
- **Usage Patterns:** Automatic detection of your browsing habits
- **Consistency Score:** Measure how consistent your daily routine is
- **Recommendations:** AI-powered suggestions for improving productivity

### API Usage Examples

#### Authentication
```javascript
// Login with Google OAuth
GET /api/auth/google

// Get current user
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Activity Tracking
```javascript
// Submit activity data from extension
POST /api/tracking/activity
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "domain": "github.com",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T10:30:00Z",
  "category": "Development",
  "productivity": 8
}
```

#### Analytics
```javascript
// Get weekly analytics
GET /api/activity/analytics?period=week
Authorization: Bearer <jwt_token>

// Get activity by category
GET /api/activity/category-breakdown?startDate=2024-01-01&endDate=2024-01-07
Authorization: Bearer <jwt_token>
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `PORT` | Server port | No | 3000 |
| `CLIENT_URL` | Frontend URL for CORS | Yes | - |
| `SESSION_SECRET` | Express session secret | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 7d |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes | - |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes | - |
| `GEMINI_API_KEY` | Google Gemini AI API key | No | - |

#### Frontend (client/.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | - |
| `VITE_APP_ENV` | Application environment | No | production |

### Browser Extension Configuration

The extension can be configured by modifying `extension/manifest.json`:

```json
{
  "externally_connectable": {
    "matches": [
      "http://localhost:5173/*",      // Local development
      "http://localhost:3000/*",      // Local backend
      "https://your-domain.com/*"     // Production frontend
    ]
  }
}
```

---

## 🛠️ Development

### Development Workflow

1. **Start development servers**
   ```bash
   # Terminal 1 - Backend with auto-reload
   npm run dev
   
   # Terminal 2 - Frontend with hot reload
   cd client && npm run dev
   ```

2. **Make changes** to code - both servers will auto-reload

3. **Test the extension** by reloading it in Chrome extensions page

### Building for Production

```bash
# Build frontend
cd client
npm run build

# The built files will be in client/dist/
```

### Database Management

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/screentime-recorder

# View collections
show collections

# Query activities
db.activities.find().limit(5)

# Clear all data (development only)
db.activities.deleteMany({})
db.users.deleteMany({})
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot connect to MongoDB"
- **Solution:** Ensure MongoDB is running: `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux)
- **Check:** MongoDB connection string in `.env` file

#### "Google OAuth error"
- **Solution:** Verify Google OAuth credentials in `.env`
- **Check:** Authorized origins and redirect URIs in Google Cloud Console
- **Ensure:** APIs are enabled (Google+ API, People API)

#### "Extension not tracking"
- **Solution:** Reload the extension in Chrome
- **Check:** Extension permissions are granted
- **Verify:** Backend is running and accessible

#### "CORS errors"
- **Solution:** Check `CLIENT_URL` in backend `.env`
- **Verify:** Frontend URL is in the allowed origins list

#### "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Debug Mode

Enable debug logging by setting:
```bash
# Backend
NODE_ENV=development

# Frontend
VITE_APP_ENV=development
```

---

## 📚 Additional Resources

- **[Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)** - Detailed OAuth configuration
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute to the project
- **[API Documentation](./API_DOCS.md)** - Complete API reference
- **[Chrome Extension Development](https://developer.chrome.com/docs/extensions/)** - Official Chrome extension docs

---
