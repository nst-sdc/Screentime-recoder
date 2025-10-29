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

#### User Authentication
- JSON Web Tokens (JWT) + Google OAuth
- User sessions for tracking and saving focus data
- Secure password hashing and session management
- Role-based support planned for future (students/admins)

#### API Key Authentication
- All API endpoints require a valid API key
- API keys must be included in request headers: `X-API-Key: your_api_key`
- Requests without valid API keys will receive 401 Unauthorized response
- API keys can be obtained by contacting the system administrator
- Keep your API key secure and never share it publicly

Example API Request:
```bash
curl -X GET 'https://api.screentime-recorder.com/v1/activity' \
-H 'X-API-Key: your_api_key'
```

Response without API key or invalid key:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

For security reasons:
- Store API keys securely (use environment variables)
- Rotate API keys periodically
- Do not commit API keys to version control
- Use different API keys for development and production

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
