# Tgen Robotics Hub - Server Implementation

This file contains instructions for the backend server implementation for the Tgen Robotics Hub website. The server provides API endpoints for the robotics encyclopedia, user authentication, and content management.

## Overview

The server implementation uses:
- Node.js with Express for the server framework
- MongoDB for the database
- JWT for authentication
- Multer for file uploads
- AWS S3 for media storage (optional)

## Directory Structure

```
server/
├── config/           # Configuration files
├── controllers/      # API controllers
├── middleware/       # Express middleware
├── models/           # Mongoose models
├── routes/           # API routes
├── utils/            # Utility functions
├── uploads/          # Temporary file upload directory
└── server.js         # Main server file
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install the dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the server directory with the following environment variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tgen-robotics
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   
   # Optional - for AWS S3 storage
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

3. Start the server:
   ```
   npm start
   ```

   For development with hot reloading:
   ```
   npm run dev
   ```

4. The server will be running at `http://localhost:5000`

## Admin Login

Default admin credentials:
- Email: tgen.robotics@gmail.com
- Password: Admin123!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### Robots
- `GET /api/robots` - Get all robots
- `GET /api/robots/:id` - Get robot by ID or slug
- `POST /api/robots` - Create new robot (admin only)
- `PUT /api/robots/:id` - Update robot (admin only)
- `DELETE /api/robots/:id` - Delete robot (admin only)

### Categories
- `GET /api/robots/categories` - Get all categories

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## Frontend Integration

The frontend files in the main branch can work with this server by:

1. Modifying the API endpoint URLs to point to this server
2. Including the JWT token in authenticated requests

## Running in Production

For production deployment:

1. Set the environment to production:
   ```
   NODE_ENV=production
   ```

2. Use a process manager like PM2:
   ```
   npm install -g pm2
   pm2 start server.js
   ```

3. Set up a reverse proxy with Nginx or similar

## Notes

- The server can run alongside the GitHub Pages version, with the static files serving as a demo mode
- For a full-featured application, use this server implementation
