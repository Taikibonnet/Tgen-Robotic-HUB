// server.js - Main server file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/robots', require('./routes/api/robots'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/news', require('./routes/api/news'));
app.use('/api/categories', require('./routes/api/categories'));
app.use('/api/media', require('./routes/api/media'));

// Serve admin routes
app.get('/admin/*', (req, res) => {
  if (req.path === '/admin/login') {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
  } else {
    // Check for authentication here if needed
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
  }
});

// Serve robot detail pages
app.get('/encyclopedia/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robot-detail.html'));
});

// Serve homepage for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database connection
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tgen-robotics';

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB Connected');
    
    // Initialize admin user if needed
    initAdminUser();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
  });

// Initialize admin user
async function initAdminUser() {
  try {
    const User = require('./models/User');
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'tgen.robotics@gmail.com' });
    
    if (!adminExists) {
      console.log('Creating admin user...');
      
      const bcrypt = require('bcryptjs');
      
      // Create admin user
      const admin = new User({
        email: 'tgen.robotics@gmail.com',
        password: await bcrypt.hash('Admin123!', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      
      await admin.save();
      console.log('Admin user created successfully');
    }
  } catch (err) {
    console.error('Error initializing admin user:', err);
  }
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});