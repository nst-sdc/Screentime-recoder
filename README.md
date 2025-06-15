# 📚 Screen Time Recorder

---

### 🧠 Project Overview

The **Screen Time Recorder** helps users track and improve their actual study time by analyzing screen content and monitoring eye movements. The app runs in the background and uses AI to detect focus, identify difficult topics, and provide contextual support to help users study more effectively.

---

### 🎯 Objectives

- Detect real vs. ineffective screen time.
- Identify “hard” topics based on screen and focus behavior.
- Analyze eye movements for distraction or deep concentration.
- Provide smart nudges and topic-specific resources.

---

### 🏗️ Features

- **🖥️ Screen Monitoring**: Detects how long a user stays on a slide or screen.
- **👁️ Eye Tracking**: Tracks gaze and blink patterns to measure attention.
- **📊 Focus Analytics**: Distinguishes Effective Time, Distraction, and Difficult Sections.
- **📚 Smart Feedback**: Sends reminders or study resources based on user behavior.
- **🔒 Secure Authentication**: Using JWT or Firebase Auth.
- **📈 Personalized Dashboard**: Insights into focus levels and time allocation.

---

### 🔧 Tech Stack

| Layer          | Tech                                                             |
| -------------- | ---------------------------------------------------------------- |
| Frontend       | React.js                                                         |
| Backend        | Node.js + Express / Django (TBD)                                 |
| Database       | MongoDB / PostgreSQL (TBD)                                       |
| Authentication | JWT / Firebase Auth                                              |
| Deployment     | Vercel / Netlify (frontend), Railway / Heroku / Render (backend) |
| AI Tools       | OpenCV, MediaPipe (eye tracking), Tesseract (OCR)                |

---

### 🔐 Authentication

- JSON Web Tokens (JWT) or Firebase Auth
- User sessions for tracking and saving focus data
- Role-based support planned for future (students/admins)

---

### 📁 Project Structure

```shell
screentime-recorder/
├── client/ # React Frontend
├── server/ # Node.js Backend
├── README.md
└── LICENSE
```
