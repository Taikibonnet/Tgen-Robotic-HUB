// controllers/userController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    
    // Search query
    if (req.query.search) {
      filter.$or = [
        { email: { $regex: req.query.search, $options: 'i' } },
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Role filter
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or Own User)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is admin or own profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or Own User)
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is admin or own profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Extract data
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      preferences
    } = req.body;
    
    // Update basic fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    // Update email (check for uniqueness)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    
    // Update password
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }
    
    // Update role (admin only)
    if (role && req.user.role === 'admin') {
      user.role = role;
    }
    
    // Update preferences
    if (preferences) {
      if (typeof preferences === 'string') {
        try {
          user.preferences = JSON.parse(preferences);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid preferences format' });
        }
      } else {
        user.preferences = preferences;
      }
    }
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting own account
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await User.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add robot to favorites
// @route   POST /api/users/favorites/:robotId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if robot is already in favorites
    if (user.activity.favoriteRobots.includes(req.params.robotId)) {
      return res.status(400).json({ message: 'Robot already in favorites' });
    }
    
    // Add to favorites
    user.activity.favoriteRobots.push(req.params.robotId);
    
    await user.save();
    
    res.json(user.activity.favoriteRobots);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove robot from favorites
// @route   DELETE /api/users/favorites/:robotId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Filter out the robot ID
    user.activity.favoriteRobots = user.activity.favoriteRobots.filter(
      id => id.toString() !== req.params.robotId
    );
    
    await user.save();
    
    res.json(user.activity.favoriteRobots);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's favorite robots
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'activity.favoriteRobots',
      select: 'name slug manufacturer categories summary media.featuredImage',
      match: { status: 'published' }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.activity.favoriteRobots);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's recently viewed robots
// @route   GET /api/users/recent
// @access  Private
exports.getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'activity.recentlyViewed.robot',
      select: 'name slug manufacturer categories summary media.featuredImage',
      match: { status: 'published' }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Filter out any null robot entries (could happen if robots were deleted)
    const recentlyViewed = user.activity.recentlyViewed
      .filter(item => item.robot != null)
      .map(item => ({
        robot: item.robot,
        timestamp: item.timestamp
      }));
    
    res.json(recentlyViewed);
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add robot to recently viewed
// @route   POST /api/users/recent/:robotId
// @access  Private
exports.addToRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove if already exists (to move it to the top)
    user.activity.recentlyViewed = user.activity.recentlyViewed.filter(
      item => item.robot.toString() !== req.params.robotId
    );
    
    // Add to the beginning of recently viewed
    user.activity.recentlyViewed.unshift({
      robot: req.params.robotId,
      timestamp: Date.now()
    });
    
    // Keep only the 10 most recent
    if (user.activity.recentlyViewed.length > 10) {
      user.activity.recentlyViewed = user.activity.recentlyViewed.slice(0, 10);
    }
    
    await user.save();
    
    res.json(user.activity.recentlyViewed);
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user stats for admin dashboard
// @route   GET /api/users/stats
// @access  Private (Admin only)
exports.getUserStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const editorUsers = await User.countDocuments({ role: 'editor' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    // Get new users in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get recently active users
    const recentlyActive = await User.find({
      lastLogin: { $gte: sevenDaysAgo }
    })
    .sort({ lastLogin: -1 })
    .limit(5)
    .select('firstName lastName email lastLogin');
    
    // Get most recent registrations
    const recentRegistrations = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt');
    
    res.json({
      counts: {
        total: totalUsers,
        admin: adminUsers,
        editor: editorUsers,
        regular: regularUsers,
        newThisWeek: newUsers
      },
      recentlyActive,
      recentRegistrations
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};