# Tgen Robotics Hub

A comprehensive online encyclopedia for robotics enthusiasts, researchers, and industry professionals. The platform provides detailed information about various robots, news about the latest developments in robotics, and an interactive user experience enhanced by an AI assistant.

## Features

- **Detailed Robot Database**: Comprehensive information about various robots with specifications, images, and applications
- **User Accounts**: Personalized experience with favorites and recently viewed history
- **Admin Dashboard**: Powerful content management system for adding and editing robot entries
- **News Section**: Latest updates and articles from the robotics world
- **Interactive AI Assistant**: Context-aware robot guide for better user experience
- **Responsive Design**: Modern UI that works across all devices

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- AWS S3 for media storage

### Frontend
- HTML/CSS/JavaScript
- Modern responsive design
- Admin dashboard with robot management

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- AWS Account (for S3 media storage)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Taikibonnet/Tgen-Robotic-HUB.git
   cd Tgen-Robotic-HUB
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create .env file
   ```
   cp .env.example .env
   ```
   Then edit the .env file with your configuration details:
   - Set your MongoDB connection URI
   - Configure a JWT secret
   - Add AWS credentials if using S3 for media storage

4. Start the server
   ```
   npm run server
   ```

5. Access the application
   - Main site: http://localhost:5000
   - Admin dashboard: http://localhost:5000/admin
   - Default admin login:
     - Email: tgen.robotics@gmail.com
     - Password: Admin123!

### Development Mode

To run the server with hot reloading:

```
npm run dev
```

## Admin Dashboard

The admin dashboard can be accessed at `/admin` and provides the following functionality:

- Add, edit, and delete robot entries
- Manage categories and tags
- Publish news articles
- Upload and manage media files
- View site statistics
- Manage user accounts

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register a new user
- `GET /api/auth/me` - Get current user data

### Robots
- `GET /api/robots` - Get all robots
- `GET /api/robots/:id` - Get robot by ID or slug
- `POST /api/robots` - Create a new robot (admin only)
- `PUT /api/robots/:id` - Update a robot (admin only)
- `DELETE /api/robots/:id` - Delete a robot (admin only)
- `GET /api/robots/categories` - Get robot categories
- `GET /api/robots/popular` - Get popular robots
- `GET /api/robots/:id/related` - Get related robots

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/favorites` - Get user's favorite robots
- `POST /api/users/favorites/:robotId` - Add robot to favorites
- `DELETE /api/users/favorites/:robotId` - Remove robot from favorites

## Project Structure

```
tgen-robotics-hub/
├── controllers/        # API controllers
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── public/             # Static frontend files
├── utils/              # Utility functions
└── uploads/            # Temporary file uploads
```

## Future Enhancements

1. **Mobile Application**: Develop dedicated iOS and Android apps
2. **Interactive 3D Models**: Add WebGL-based 3D robot viewers
3. **Community Features**: Implement forums or discussion boards
4. **Educational Content**: Add tutorials and courses
5. **AR/VR Experiences**: Create immersive robot experiences
6. **Marketplace Integration**: Connect users with robot manufacturers
7. **Multilingual Support**: Translate content for global audiences

## License

This project is licensed under the MIT License.

## Contributors

- Taiki Bonnet - Project Lead & Developer

---

For more information, visit the [Project Wiki](https://github.com/Taikibonnet/Tgen-Robotic-HUB/wiki) (coming soon).
