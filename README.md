# 📚 Screen Time Recorder

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-6.0%2B-green.svg)

*A comprehensive screen time tracking application with AI-powered insights and productivity analytics*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🛠️ Development](#️-development-setup) • [🤝 Contributing](#-contributing)

</div>

---

## 🧠 Project Overview

The **Screen Time Recorder** is a privacy-focused productivity tracking application that helps users understand and improve their digital habits. It combines a React-based dashboard, Node.js backend, and Chrome extension to provide comprehensive insights into screen time usage with AI-powered categorization and productivity scoring.

### ✨ Key Highlights
- 🔒 **Privacy-First**: All data processing happens locally with optional cloud sync
- 🤖 **AI-Powered**: Intelligent categorization using Google's Gemini AI
- 📊 **Rich Analytics**: Interactive visualizations and productivity insights
- 🌐 **Cross-Platform**: Web dashboard + Chrome extension integration
- 🧪 **Well-Tested**: 96.7% test coverage with comprehensive test suite

---

## 🎯 Objectives

- **Digital Awareness**: Help users develop consciousness of their digital habits through meaningful data
- **Privacy Control**: Provide a privacy-focused tracking tool that respects user autonomy
- **Actionable Insights**: Deliver visual insights into productivity patterns without manual input
- **Seamless Integration**: Browser extension that tracks sessions automatically in the background
- **Productivity Enhancement**: AI-powered suggestions and behavioral pattern recognition

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Installation guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download here](https://git-scm.com/)
- **Chrome Browser** (for extension development)

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nst-sdc/Screentime-recoder.git
   cd Screentime-recoder
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/screentime-recorder
   
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   CLIENT_URL=http://localhost:5173
   SESSION_SECRET=your_session_secret_here
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   
   # Gemini AI (optional)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Install and start backend**
   ```bash
   cd server
   npm install
   npm run dev
   ```

5. **Install and start frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/api/health

---

## 🏗️ Features

### 🔐 **Secure Authentication**
- **Google OAuth Integration**: One-click sign-in with Google
- **Local Authentication**: Email/password registration and login
- **JWT Security**: Secure token-based authentication
- **Session Management**: Automatic session handling and refresh

### 📊 **Comprehensive Analytics**
- **Productivity Metrics**: 0-10 scoring system with trend analysis
- **Category Breakdown**: AI-powered activity categorization
- **Time Tracking**: Precise session duration and idle time detection
- **Visual Reports**: Interactive charts and graphs using D3.js

### 📈 **Advanced Visualizations**
- **Activity Heatmap**: Hour-by-hour usage patterns throughout the week
- **Sunburst Chart**: Hierarchical view of categories and domains
- **Productivity Trends**: Line graphs showing productivity over time
- **Category Distribution**: Pie charts and bar graphs for activity breakdown

### 🧠 **AI-Powered Insights**
- **Smart Categorization**: Automatic website and activity classification
- **Behavioral Patterns**: Detection of usage patterns and habits
- **Productivity Scoring**: Intelligent scoring based on activity type
- **Peak Hours Analysis**: Identification of most productive time periods

### 🌐 **Browser Extension**
- **Automatic Tracking**: Background monitoring of tab activity
- **Real-time Sync**: Data synchronization every 30 seconds
- **Privacy Controls**: User-controlled tracking preferences
- **Manifest V3**: Latest Chrome extension standards

---

## 🔧 Tech Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Frontend** | React.js + Vite | 18.2.0 | User interface and dashboard |
| **Backend** | Node.js + Express | 18+ | API server and business logic |
| **Database** | MongoDB | 6.0+ | Data storage and persistence |
| **Authentication** | JWT + Google OAuth | - | User authentication and authorization |
| **Visualization** | D3.js | 7.8+ | Interactive charts and graphs |
| **Extension** | Chrome Extension API | Manifest V3 | Browser integration |
| **AI/ML** | Google Gemini AI | - | Content categorization |
| **Testing** | Jest + Supertest | 29+ | Unit and integration testing |
| **Deployment** | Vercel + Render | - | Cloud hosting and deployment |

---

## 🛠️ Development Setup

### Backend Development

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev  # Uses nodemon for auto-restart
   ```

4. **Run tests**
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Run tests in watch mode
   npm run test:coverage # Generate coverage report
   ```

### Frontend Development

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev  # Starts Vite dev server
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

### Chrome Extension Development

1. **Navigate to extension directory**
   ```bash
   cd extension
   ```

2. **Load extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder

3. **Development workflow**
   - Make changes to extension files
   - Click "Reload" button in Chrome extensions page
   - Test functionality in browser

---

## 📁 Project Structure

```
screentime-recorder/
├── 📁 client/                          # React Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/              # Reusable UI components
│   │   ├── 📁 pages/                   # Page components
│   │   ├── 📁 hooks/                   # Custom React hooks
│   │   ├── 📁 utils/                   # Utility functions
│   │   ├── 📁 styles/                  # CSS and styling
│   │   └── 📄 main.jsx                 # Application entry point
│   ├── 📄 package.json                 # Frontend dependencies
│   ├── 📄 vite.config.js              # Vite configuration
│   └── 📄 index.html                   # HTML template
│
├── 📁 server/                          # Node.js Backend Application
│   ├── 📁 controllers/                 # Request handlers
│   │   ├── 📄 auth.controller.js       # Authentication logic
│   │   ├── 📄 activity.controller.js   # Activity management
│   │   └── 📄 user.controller.js       # User management
│   ├── 📁 models/                      # Database models
│   │   ├── 📄 user.model.js           # User schema
│   │   ├── 📄 activity.model.js       # Activity schema
│   │   └── 📄 category.model.js       # Category schema
│   ├── 📁 routes/                      # API route definitions
│   ├── 📁 middleware/                  # Custom middleware
│   ├── 📁 config/                      # Configuration files
│   ├── 📁 utils/                       # Utility functions
│   └── 📄 server.js                    # Server entry point
│
├── 📁 extension/                       # Chrome Extension
│   ├── 📄 manifest.json               # Extension manifest
│   ├── 📄 background.js               # Background script
│   ├── 📄 content.js                  # Content script
│   └── 📁 popup/                      # Extension popup UI
│
├── 📁 tests/                          # Test Suite
│   ├── 📁 unit/                       # Unit tests
│   ├── 📁 integration/                # Integration tests
│   ├── 📁 fixtures/                   # Test data
│   └── 📄 setup.js                    # Test configuration
│
├── 📁 coverage/                       # Test coverage reports
├── 📄 .env.example                    # Environment variables template
├── 📄 .env.test                       # Test environment variables
├── 📄 jest.config.js                  # Jest test configuration
├── 📄 package.json                    # Root package configuration
├── 📄 TESTING.md                      # Testing documentation
├── 📄 TEST_RESULTS.md                 # Test results report
├── 📄 CONTRIBUTING.md                 # Contribution guidelines
└── 📄 README.md                       # This file
```

---

## 🔐 Authentication & Security

### Authentication Methods

1. **Google OAuth 2.0**
   ```javascript
   // Example: Initiating Google OAuth
   GET /api/auth/google
   ```

2. **Local Authentication**
   ```javascript
   // Registration
   POST /api/auth/register
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "securePassword123"
   }
   
   // Login
   POST /api/auth/login
   {
     "email": "john@example.com",
     "password": "securePassword123"
   }
   ```

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting (planned)
- **HTTPS Enforcement**: SSL/TLS in production

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update user profile | ✅ |
| DELETE | `/api/auth/account` | Delete user account | ✅ |
| POST | `/api/auth/logout` | User logout | ❌ |
| GET | `/api/auth/verify` | Verify JWT token | ✅ |

### Activity Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/activity/log` | Log new activity | ✅ |
| GET | `/api/activity/summary` | Get activity summary | ✅ |
| GET | `/api/activity/analytics/categories` | Category analytics | ✅ |
| GET | `/api/activity/analytics/productivity` | Productivity insights | ✅ |
| GET | `/api/activity/categories` | Available categories | ✅ |
| POST | `/api/activity/end-all` | End all active sessions | ✅ |
| POST | `/api/activity/recategorize` | Recategorize activities | ✅ |

### Example API Usage

```javascript
// Log a new activity
const response = await fetch('/api/activity/log', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    sessionId: 'unique-session-id',
    url: 'https://github.com/project',
    domain: 'github.com',
    title: 'Project Repository',
    action: 'visit',
    productivityScore: 8
  })
});

// Get activity summary
const summary = await fetch('/api/activity/summary?startDate=2024-01-01&endDate=2024-01-31', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🧪 Testing

The project includes a comprehensive test suite with 96.7% success rate.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test categories
npm test -- --testPathPattern="unit"
npm test -- --testPathPattern="integration"
```

### Test Categories

- **Unit Tests**: Models and controllers (52 tests)
- **Integration Tests**: API endpoints (36 tests)
- **Coverage Reports**: HTML reports in `coverage/` directory

### Test Results Summary

- ✅ **User Model**: 19/19 tests passed
- ✅ **Activity Model**: 16/16 tests passed
- ✅ **Auth Controller**: 17/17 tests passed
- ✅ **API Integration**: 33/36 tests passed

For detailed testing information, see [TESTING.md](./TESTING.md) and [TEST_RESULTS.md](./TEST_RESULTS.md).

---

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
   ```env
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/screentime
   CLIENT_URL=https://your-frontend-domain.com
   JWT_SECRET=your-production-jwt-secret
   GOOGLE_CLIENT_ID=your-production-google-client-id
   GOOGLE_CLIENT_SECRET=your-production-google-client-secret
   ```

### Backend Deployment (Render)

1. **Connect GitHub repository** to Render
2. **Set environment variables** in Render dashboard
3. **Configure build command**: `npm install`
4. **Configure start command**: `npm start`

### Frontend Deployment (Vercel)

1. **Connect GitHub repository** to Vercel
2. **Set build command**: `npm run build`
3. **Set output directory**: `dist`
4. **Configure environment variables** for API endpoints

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas cluster**
2. **Configure network access** and database users
3. **Update connection string** in environment variables

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | ✅ | development |
| `PORT` | Server port | ❌ | 3000 |
| `MONGO_URI` | MongoDB connection string | ✅ | - |
| `CLIENT_URL` | Frontend URL | ✅ | http://localhost:5173 |
| `JWT_SECRET` | JWT signing secret | ✅ | - |
| `JWT_EXPIRES_IN` | JWT expiration time | ❌ | 7d |
| `SESSION_SECRET` | Session secret | ✅ | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ❌ | - |
| `GEMINI_API_KEY` | Google Gemini AI API key | ❌ | - |

### Database Configuration

The application uses MongoDB with the following collections:

- **users**: User accounts and profiles
- **activities**: Screen time activity records
- **categories**: Activity categories and classifications

### Chrome Extension Configuration

Update `extension/manifest.json` for production:

```json
{
  "host_permissions": [
    "https://your-backend-domain.com/*"
  ],
  "externally_connectable": {
    "matches": ["https://your-frontend-domain.com/*"]
  }
}
```

---

## 📖 Usage Examples

### Basic Usage Flow

1. **User Registration/Login**
   ```javascript
   // Register new user
   const user = await register({
     name: "John Doe",
     email: "john@example.com",
     password: "securePassword123"
   });
   ```

2. **Install Chrome Extension**
   - Load extension in Chrome
   - Grant necessary permissions
   - Extension starts tracking automatically

3. **View Dashboard**
   - Access web dashboard at frontend URL
   - View real-time activity data
   - Analyze productivity metrics

4. **Activity Logging**
   ```javascript
   // Automatic logging via extension
   const activity = {
     sessionId: generateSessionId(),
     url: window.location.href,
     domain: window.location.hostname,
     title: document.title,
     startTime: new Date(),
     action: 'visit'
   };
   ```

### Advanced Features

1. **Custom Categories**
   ```javascript
   // Create custom activity category
   const category = await createCategory({
     name: "Learning",
     color: "#4CAF50",
     productivityScore: 9,
     keywords: ["tutorial", "course", "documentation"]
   });
   ```

2. **Productivity Analysis**
   ```javascript
   // Get productivity insights
   const insights = await getProductivityInsights({
     startDate: "2024-01-01",
     endDate: "2024-01-31",
     groupBy: "day"
   });
   ```

3. **Data Export**
   ```javascript
   // Export activity data
   const exportData = await exportActivities({
     format: "csv",
     dateRange: "last30days",
     includeCategories: true
   });
   ```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent categorization
- **MongoDB** for reliable data storage
- **React & Vite** for excellent development experience
- **Jest & Supertest** for comprehensive testing
- **Open Source Community** for inspiration and support

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/nst-sdc/Screentime-recoder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nst-sdc/Screentime-recoder/discussions)
- **Documentation**: [Project Wiki](https://github.com/nst-sdc/Screentime-recoder/wiki)

---

<div align="center">

**Made with ❤️ by the Screentime-Recorder Team**

[⭐ Star this repo](https://github.com/nst-sdc/Screentime-recoder) • [🐛 Report Bug](https://github.com/nst-sdc/Screentime-recoder/issues) • [💡 Request Feature](https://github.com/nst-sdc/Screentime-recoder/issues)

</div>
