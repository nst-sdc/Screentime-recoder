# 🕒 Screen Time Recorder

<div align="center">

[![Live Demo](https://image2url.com/images/1761167385267-df4ceab1-64c6-44f7-ba96-f1ea3c7b505b.png)](https://screentime-recoder.vercel.app/)

[![Live Demo](https://image2url.com/images/1761167423003-4a317207-18b8-434a-b8ff-34ad75f52123.png)](https://screentime-recoder.vercel.app/)
**Track and analyze your digital productivity with AI-powered insights**

[Live Demo](https://screentime-recoder.vercel.app/) • [Report Bug](https://github.com/nst-sdc/Screentime-recoder/issues) • [Request Feature](https://github.com/nst-sdc/Screentime-recoder/issues)

</div>

---

## 📋 Overview

Screen Time Recorder is an intelligent productivity tracking application that automatically monitors browser activity, analyzes usage patterns, and provides actionable insights to help you optimize your digital habits.

### ✨ Key Features

- 🔐 **Secure Authentication** - Google OAuth 2.0
- 📊 **Visual Analytics** - Heatmaps, charts, and graphs
- 🧠 **AI Insights** - Productivity scoring and pattern detection
- 🌐 **Browser Extension** - Automatic activity tracking
- 📱 **Responsive Design** - Works on all devices

---

## 🛠️ Tech Stack

**Frontend:** React.js + Vite + TailwindCSS + D3.js  
**Backend:** Node.js + Express.js + MongoDB  
**Extension:** Chrome Manifest V3  
**Deployment:** Vercel (frontend) + Render (backend)

---

## 📦 Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- npm (v9+)
- Chrome Browser

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/nst-sdc/Screentime-recoder.git
cd Screentime-recoder
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/screentime
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

Start server:
```bash
npm run dev
# Server runs at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start app:
```bash
npm run dev
# App runs at http://localhost:5173
```

### 4. Extension Setup

```bash
cd ../extension

# Install dependencies
npm install

# Build extension
npm run build
```

**Load in Chrome:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist` folder

---

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Authorized origins: `http://localhost:5173`, `http://localhost:5000`
   - Redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Secret to `.env` files

### MongoDB Setup

**Local:**
```bash
# Start MongoDB
mongod --dbpath /path/to/data
```

**Atlas (Cloud):**
1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP: `0.0.0.0/0`
4. Get connection string
5. Update `MONGODB_URI` in `.env`

---

## 📁 Project Structure

```
screentime-recorder/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main app component
│   ├── .env             # Frontend environment variables
│   └── package.json     # Frontend dependencies
│
├── server/              # Node.js backend
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── config/          # Configuration files
│   ├── .env             # Backend environment variables
│   └── server.js        # Entry point
│
└── extension/           # Chrome extension
    ├── manifest.json    # Extension manifest
    ├── background.js    # Background service worker
    ├── popup.html       # Extension popup
    └── content.js       # Content script
```

---

## 🎯 Usage

### 1. Sign In
- Open `http://localhost:5173`
- Click "Sign in with Google"
- Authorize the application

### 2. Install Extension
- Load extension in Chrome
- Click extension icon to activate tracking

### 3. View Dashboard
- Dashboard auto-populates with tracked data
- View analytics, heatmaps, and insights
- Filter by date, category, or productivity score

### 4. Track Activity
- Extension automatically tracks browser activity
- Data syncs every 30 seconds
- View real-time updates in dashboard

---

## 📊 Features Overview

### Dashboard Components

**Activity Heatmap**
- Hour-by-hour usage visualization
- Weekly activity patterns
- Peak productivity hours

**Productivity Metrics**
- Productivity score (0-10)
- Time spent per category
- Productive vs unproductive ratio

**Visual Charts**
- Pie charts: Activity distribution
- Bar charts: Domain breakdown
- Line graphs: Productivity trends
- Sunburst: Hierarchical view

**Behavioral Insights**
- Peak active hours
- Most productive days
- Consistency score
- Usage pattern detection

---

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### Run All Tests
```bash
npm run test:all
```

---

## 📚 API Documentation

### Authentication
```
POST /api/auth/register       # Register new user
POST /api/auth/login          # Login user
GET  /api/auth/google         # Google OAuth
GET  /api/auth/logout         # Logout user
```

### Activities
```
GET    /api/activities        # Get all activities
POST   /api/activities        # Create activity
GET    /api/activities/:id    # Get single activity
PUT    /api/activities/:id    # Update activity
DELETE /api/activities/:id    # Delete activity
```

### Analytics
```
GET /api/analytics/dashboard  # Dashboard data
GET /api/analytics/heatmap    # Heatmap data
GET /api/analytics/insights   # Behavioral insights
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd client

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Backend (Render)

1. Create new Web Service on [Render](https://render.com)
2. Connect GitHub repository
3. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
4. Add environment variables
5. Deploy

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB is running
mongod --version

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod           # Linux
```

**Port Already in Use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

**Extension Not Loading**
- Rebuild extension: `npm run build`
- Check Chrome console for errors
- Verify manifest.json is valid

**OAuth Error**
- Verify Google Client ID/Secret
- Check authorized origins in Google Console
- Clear browser cookies and retry

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI framework
- [D3.js](https://d3js.org/) - Data visualization
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Hosting

---

## 📞 Support

- 📧 Email: support@screentime-recorder.com
- 🐛 Issues: [GitHub Issues](https://github.com/nst-sdc/Screentime-recoder/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/nst-sdc/Screentime-recoder/discussions)

---

<div align="center">

**Made with ❤️ by the Screen Time Recorder Team**

⭐ Star us on GitHub if you find this project helpful!

</div>