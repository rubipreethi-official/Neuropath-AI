# Setup Instructions - Neuropath AI with MongoDB Authentication

## Overview
This app now requires users to sign in/sign up before accessing career guidance. User data is stored in MongoDB, and usernames are displayed throughout the app.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (already configured)
- Firebase project (already configured)

## Installation Steps

### 1. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd B-Neuro/AI-Neuro/backend
npm install
```

### 2. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

In a new terminal, navigate to the frontend folder:

```bash
cd B-Neuro/AI-Neuro
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `B-Neuro/AI-Neuro` folder:

```
VITE_API_URL=http://localhost:5000
```

### 5. Start the Frontend

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## How It Works

### 1. **User Authentication Flow**
   - Users must sign up or sign in to proceed
   - Sign up requires: Name, Email, Password
   - Data is stored in both Firebase (auth) and MongoDB (user details)

### 2. **MongoDB Storage**
   - **Database**: `neuropath_db`
   - **Collection**: `users`
   - **Fields**: 
     - `uid` (Firebase UID)
     - `name` (Full name)
     - `email`
     - `createdAt`
     - `lastLogin`

### 3. **Username Display**
   - Landing page navbar: "Welcome, [Name]!"
   - chat2.tsx result: "[Name], your identified area of interest is..."
   - Career Report title: "[Name]'s Personalized Career Report"
   - Career Report header: "Career Path Analysis for [Name]"

### 4. **Protected Routes**
   - "Start Your Journey" button requires authentication
   - If not logged in, clicking it opens the signup modal
   - After login, users can proceed to the assessment

## API Endpoints

### Backend API (http://localhost:5000)

#### POST `/api/users`
Create or update user in MongoDB
```json
{
  "uid": "firebase-uid",
  "name": "Rubi Preethi",
  "email": "user@example.com"
}
```

#### GET `/api/users/:uid`
Get user by Firebase UID

#### PATCH `/api/users/:uid/login`
Update user's last login timestamp

#### GET `/api/users`
Get all users (for admin)

#### GET `/health`
Health check endpoint

## MongoDB Connection

The backend connects to your MongoDB Atlas cluster:
```
mongodb+srv://rubipreethi2004_db_user:neuropath@cluster0.qjohmcm.mongodb.net/
Database: neuropath_db
```

## Troubleshooting

### Backend won't start
- Ensure MongoDB URI is correct in `backend/.env`
- Check if port 5000 is available
- Verify npm dependencies are installed

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `.env` file has `VITE_API_URL=http://localhost:5000`
- Look for CORS errors in browser console

### User not found after sign up
- Check backend logs for errors
- Verify MongoDB connection is successful
- Check if user was created in Firebase but not MongoDB

### Username not displaying
- Open browser DevTools console
- Check for API fetch errors
- Verify user is logged in (check `user` in AuthContext)

## Features

✅ Firebase Authentication for secure login
✅ MongoDB storage for user data
✅ Name field in signup form
✅ Protected routes - must authenticate to proceed
✅ Username displayed in chat2.tsx AI result
✅ Username displayed in CareerReport
✅ Auto-login tracking (last login timestamp)
✅ Welcome message on landing page

## Development Notes

- Frontend runs on Vite dev server
- Backend runs on Express
- Both must be running simultaneously
- Hot reload enabled for both frontend and backend (with nodemon)

## Production Deployment

For production:
1. Update `VITE_API_URL` to your production backend URL
2. Deploy backend to a service like Heroku, Railway, or Vercel
3. Deploy frontend to Vercel, Netlify, or similar
4. Update CORS settings in backend for production domain
5. Ensure MongoDB Atlas allows connections from production servers

