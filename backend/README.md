# Neuropath Backend API

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or with auto-reload for development:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Environment Variables

The MongoDB URI is already configured in the code, but you can override it by creating a `.env` file:

```
PORT=5000
MONGODB_URI=mongodb+srv://rubipreethi2004_db_user:neuropath@cluster0.qjohmcm.mongodb.net/?appName=Cluster0
```

## API Endpoints

- `POST /api/users` - Create/update user
- `GET /api/users/:uid` - Get user by Firebase UID
- `PATCH /api/users/:uid/login` - Update last login
- `GET /api/users` - Get all users
- `GET /health` - Health check

## Database

- **Database Name**: `neuropath_db`
- **Collection**: `users`
- **Schema**:
  - `uid` (String, required, unique) - Firebase user ID
  - `name` (String, required) - User's full name
  - `email` (String, required, unique)
  - `createdAt` (Date)
  - `lastLogin` (Date)


