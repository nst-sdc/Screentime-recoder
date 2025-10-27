# 📡 API Documentation - Screen Time Recorder

This document provides comprehensive documentation for all API endpoints in the Screen Time Recorder application.

## 📋 Table of Contents

- [Base URL & Authentication](#-base-url--authentication)
- [Response Format](#-response-format)
- [Authentication Endpoints](#-authentication-endpoints)
- [User Management Endpoints](#-user-management-endpoints)
- [Activity Tracking Endpoints](#-activity-tracking-endpoints)
- [Analytics Endpoints](#-analytics-endpoints)
- [Health Check Endpoints](#-health-check-endpoints)
- [Error Codes](#-error-codes)
- [Rate Limiting](#-rate-limiting)
- [Examples](#-examples)

---

## 🌐 Base URL & Authentication

### Base URLs
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-backend-domain.com/api`

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Content Type
All POST/PUT requests should include:

```http
Content-Type: application/json
```

---

## 📄 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error information"
  }
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local",
    "isEmailVerified": false
  },
  "token": "jwt_token_here"
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

---

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local",
    "isEmailVerified": false,
    "picture": null,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  },
  "token": "jwt_token_here"
}
```

---

### GET /auth/google
Initiate Google OAuth authentication.

**Response:** Redirects to Google OAuth consent screen.

---

### GET /auth/google/callback
Handle Google OAuth callback.

**Response:** Redirects to frontend with token parameter.

---

### GET /auth/verify
Verify JWT token validity.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local"
  },
  "token": "current_token_here"
}
```

---

### POST /auth/logout
Logout user (invalidate session).

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 User Management Endpoints

### GET /auth/profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "local",
    "isEmailVerified": false,
    "picture": null,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### PUT /auth/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "picture": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id_here",
    "name": "John Smith",
    "email": "john@example.com",
    "provider": "local",
    "picture": "https://example.com/avatar.jpg",
    "lastLogin": "2024-01-15T10:35:00.000Z"
  }
}
```

**Note:** Email, password, provider, and googleId cannot be updated through this endpoint.

---

### DELETE /auth/account
Delete user account permanently.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Warning:** This action is irreversible and will delete all user data.

---

## 📊 Activity Tracking Endpoints

### POST /activity/log
Log a new activity session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "sessionId": "unique-session-id-123",
  "url": "https://github.com/project/repo",
  "domain": "github.com",
  "tabName": "GitHub Repository",
  "title": "Project Repository - GitHub",
  "action": "visit",
  "duration": 300000,
  "productivityScore": 8,
  "tags": ["coding", "development"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Activity logged successfully",
  "data": {
    "id": "activity_id_here",
    "userId": "user_id_here",
    "sessionId": "unique-session-id-123",
    "url": "https://github.com/project/repo",
    "domain": "github.com",
    "title": "Project Repository - GitHub",
    "action": "visit",
    "duration": 300000,
    "productivityScore": 8,
    "isActive": true,
    "startTime": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Field Descriptions:**
- `sessionId`: Unique identifier for the session
- `url`: Full URL of the page/application
- `domain`: Domain name extracted from URL
- `tabName`: Browser tab title
- `title`: Page title
- `action`: One of: "visit", "start", "update", "end", "close"
- `duration`: Time spent in milliseconds
- `productivityScore`: Score from 1-10 (optional, defaults to 5)
- `tags`: Array of tags for categorization (optional)

---

### GET /activity/summary
Get activity summary for a date range.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): ISO date string (default: 7 days ago)
- `endDate` (optional): ISO date string (default: now)
- `groupBy` (optional): "day", "week", "month" (default: "day")

**Example Request:**
```
GET /activity/summary?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTime": 7200000,
    "totalSessions": 45,
    "averageProductivity": 6.8,
    "topDomains": [
      {
        "domain": "github.com",
        "time": 2400000,
        "sessions": 12,
        "productivity": 8.5
      }
    ],
    "dailyBreakdown": [
      {
        "date": "2024-01-15",
        "totalTime": 480000,
        "sessions": 8,
        "productivity": 7.2
      }
    ],
    "categoryBreakdown": [
      {
        "category": "Development",
        "time": 3600000,
        "percentage": 50
      }
    ]
  }
}
```

---

### POST /activity/end-all
End all active sessions for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Ended 3 active sessions"
}
```

---

## 📈 Analytics Endpoints

### GET /activity/analytics/categories
Get category-based analytics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `limit` (optional): Number of categories to return (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "name": "Development",
        "totalTime": 3600000,
        "sessions": 15,
        "averageProductivity": 8.2,
        "percentage": 45.5,
        "domains": [
          {
            "domain": "github.com",
            "time": 1800000,
            "sessions": 8
          }
        ]
      }
    ],
    "totalCategorized": 7200000,
    "uncategorizedTime": 800000
  }
}
```

---

### GET /activity/analytics/productivity
Get productivity insights and trends.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `granularity` (optional): "hour", "day", "week" (default: "day")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overallProductivity": 6.8,
    "productivityTrend": "increasing",
    "peakHours": [9, 10, 14, 15],
    "mostProductiveDays": ["Monday", "Tuesday", "Wednesday"],
    "leastProductiveDays": ["Friday", "Saturday"],
    "hourlyBreakdown": [
      {
        "hour": 9,
        "averageProductivity": 8.5,
        "totalTime": 1800000
      }
    ],
    "weeklyTrend": [
      {
        "week": "2024-W03",
        "averageProductivity": 7.2,
        "totalTime": 14400000
      }
    ]
  }
}
```

---

### GET /activity/categories
Get available activity categories.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "category_id_here",
        "name": "Development",
        "color": "#4CAF50",
        "defaultProductivityScore": 8,
        "keywords": ["github", "stackoverflow", "documentation"],
        "isSystem": true
      }
    ]
  }
}
```

---

### POST /activity/recategorize
Trigger AI-powered recategorization of activities.

**Headers:** `Authorization: Bearer <token>`

**Request Body (optional):**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "forceRecategorize": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Recategorization started",
  "data": {
    "jobId": "recategorization_job_id",
    "estimatedTime": "2-5 minutes",
    "activitiesQueued": 150
  }
}
```

---

## 🏥 Health Check Endpoints

### GET /health
Basic health check endpoint.

**Response (200):**
```json
{
  "message": "Server is running!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

### GET /api/health
Detailed health check with database status.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "responseTime": 15
  },
  "memory": {
    "used": "45.2 MB",
    "total": "128 MB"
  }
}
```

---

## ❌ Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Custom Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_FAILED` | Invalid credentials |
| `TOKEN_EXPIRED` | JWT token has expired |
| `TOKEN_INVALID` | JWT token is invalid |
| `USER_NOT_FOUND` | User does not exist |
| `USER_EXISTS` | User already exists |
| `ACTIVITY_NOT_FOUND` | Activity does not exist |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `DATABASE_ERROR` | Database operation failed |

### Example Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 6 characters"
    }
  }
}
```

---

## 🚦 Rate Limiting

Rate limiting is applied to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Activity logging**: 100 requests per minute per user
- **Analytics endpoints**: 30 requests per minute per user
- **General endpoints**: 60 requests per minute per IP

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642248000
```

---

## 💡 Examples

### Complete Authentication Flow

```javascript
// 1. Register new user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const { token } = await registerResponse.json();

// 2. Use token for authenticated requests
const profileResponse = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await profileResponse.json();
```

### Activity Logging Example

```javascript
// Log a new activity
const activityData = {
  sessionId: `session_${Date.now()}`,
  url: window.location.href,
  domain: window.location.hostname,
  title: document.title,
  action: 'visit',
  productivityScore: 7
};

const response = await fetch('/api/activity/log', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(activityData)
});

const result = await response.json();
```

### Analytics Query Example

```javascript
// Get productivity analytics for last 30 days
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);

const analyticsResponse = await fetch(
  `/api/activity/analytics/productivity?startDate=${startDate.toISOString()}&granularity=day`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const analytics = await analyticsResponse.json();
```

### Error Handling Example

```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error codes
    if (error.message.includes('Token')) {
      // Redirect to login
      window.location.href = '/login';
    }
    
    throw error;
  }
}
```

---

## 🔧 Testing the API

### Using curl

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"

# Log activity
curl -X POST http://localhost:3000/api/activity/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"sessionId":"test-123","url":"https://github.com","domain":"github.com","action":"visit"}'
```

### Using Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Base URL**: Add `{{baseUrl}}` variable with value `http://localhost:3000/api`
3. **Add Authentication**: Set up Bearer token authentication
4. **Create Requests**: Add requests for each endpoint
5. **Environment Variables**: Set up development and production environments

### Using Thunder Client (VS Code)

1. **Install Extension**: Thunder Client for VS Code
2. **Create Collection**: New collection for Screen Time Recorder API
3. **Add Requests**: Create requests for each endpoint
4. **Environment Setup**: Configure local and production environments

---

## 📚 Additional Resources

- **OpenAPI Specification**: Available at `/api/docs` (if Swagger is configured)
- **Postman Collection**: [Download here](link-to-postman-collection)
- **API Testing Guide**: See `TESTING.md` for automated API testing
- **Rate Limiting Details**: See server configuration for current limits

---

**Last Updated**: January 2024  
**API Version**: 1.0.0  
**Base URL**: `https://your-backend-domain.com/api`

For questions or issues with the API, please create an issue on our [GitHub repository](https://github.com/nst-sdc/Screentime-recoder/issues).
