# Goodminton Backend 

Backend API for the Goodminton badminton community mobile app.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm start

# Development mode (with auto-reload)
npm run dev
```

## Authentication

This backend uses **OTP (One-Time Password) authentication** for mobile apps.

### How it works:
1. User enters email
2. Backend sends 6-digit code to email
3. User enters code
4. Backend returns JWT token
5. App uses token for authenticated requests

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Routes
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login/otp` - Request OTP code
- `POST /api/auth/verify/otp` - Verify OTP and login

#### Protected Routes
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### User Routes (`/api/users`)

#### Public Routes
- `GET /api/users/:id/profile` - Get user's public profile

#### Protected Routes
- `GET /api/users/leaderboard` - Get friends leaderboard
- `GET /api/users/friends` - Get friends list
- `GET /api/users/search?q=query` - Search users
- `DELETE /api/users/friends/:id` - Remove friend

#### Friend Request Routes (Protected)
- `POST /api/users/friend-requests` - Send friend request
- `GET /api/users/friend-requests` - Get pending requests
- `POST /api/users/friend-requests/:id/accept` - Accept request
- `POST /api/users/friend-requests/:id/reject` - Reject request

### Game Routes (`/api/games`) - All Protected
- `POST /api/games` - Create new game
- `POST /api/games/:id/confirm` - Confirm game result
- `GET /api/games/pending` - Get pending game confirmations

### System Routes
- `GET /health` - Health check

### Events Received from Server
- `connected` - Connection confirmation
- `friend:request:received` - New friend request
- `friend:request:accepted` - Your request was accepted
- `game:confirmation:received` - Game confirmation needed
- `game:confirmed` - Game was confirmed

### Events Sent to Server
- `ping` - Health check
- `friend:request:accept` - Log acceptance (debugging)
- `friend:request:reject` - Log rejection (debugging)
- `game:confirm` - Log confirmation (debugging)
- 
## Testing

```bash

#test with postman 
HTTP protocol
POST http://localhost:3001/api/auth/login/otp, Content-Type, Application/Json
RAW, JSON
```
{
  "email": "poopy@gmail.com"
}
```


In development mode, the OTP code is printed to the console:
```
🔑 OTP Code: 123456
📧 Email Preview: https://ethereal.email/message/...
```

## Tech Stack

- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication tokens
- **Nodemailer** - Email service
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting

## 📁 Project Structure

```
goodminton-backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   └── authController.js  # Auth logic (OTP, register, etc.)
├── middleware/
│   └── auth.js            # JWT verification middleware
├── models/
│   ├── User.js            # User schema
│   └── AuthToken.js       # OTP token schema
├── routes/
│   └── auth.js            # API routes
├── services/
│   └── emailService.js    # Email sending logic
├── server.js              # Main server file
├── test-otp.js            # Test script
└── package.json
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/goodminton

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email (Development - uses Ethereal Email automatically)
# No config needed for development!

# Email (Production - use real email service)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```



### 1. Register a User

```javascript
POST /api/auth/register
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "phone": "+1234567890",
  "level": "beginner"
}
```

### 2. Request OTP

```javascript
POST /api/auth/login/otp
{
  "email": "user@example.com"
}
```

### 3. Verify OTP

```javascript
POST /api/auth/verify/otp
{
  "email": "user@example.com",
  "otp": "123456"
}

// Returns:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 4. Use Token for Protected Routes

```javascript
GET /api/auth/me
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```


