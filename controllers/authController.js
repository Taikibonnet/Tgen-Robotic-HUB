// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // If this is for admin dashboard access, check role
    if (req.query.admin && user.role !== 'admin' && user.role !== 'editor') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required' });
    }

    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save();

    // Create payload for JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };

    // Sign and return JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profileImage: user.profileImage
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, firstName, lastName } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password, // Will be hashed by the pre-save hook
      firstName,
      lastName,
      role: 'user' // Default role
    });

    // Save user to database
    await user.save();

    // Create payload for JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      }
    };

    // Sign and return JWT
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Logout user (client-side only)
// @route   GET /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  // Just a simple endpoint for logout to hit (actual logout happens client-side)
  res.status(200).json({ msg: 'Logout successful' });
};

// @desc    Reset password (request)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not (security)
      return res.status(200).json({ 
        msg: 'If an account with that email exists, a password reset link has been sent' 
      });
    }
    
    // Generate reset token
    const resetToken = await user.generatePasswordResetToken();
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    // In a real system, you would send an email with the reset URL
    // For this example, we're just returning success message
    
    res.status(200).json({
      msg: 'Password reset email sent',
      resetUrl // In production, don't send this back to browser
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Reset password (confirm)
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    
    // Hash the reset token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by token and check if token is expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }
    
    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Initialize admin user
// @route   POST /api/auth/init-admin
// @access  Public (should be protected in production)
exports.initAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'tgen.robotics@gmail.com' });
    
    if (adminExists) {
      return res.status(400).json({ msg: 'Admin user already exists' });
    }
    
    // Create admin user with preset credentials
    const admin = new User({
      email: 'tgen.robotics@gmail.com',
      password: 'Admin123!', // Will be hashed by the pre-save hook
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true
    });
    
    await admin.save();
    
    res.status(201).json({ msg: 'Admin user created successfully' });
  } catch (err) {
    console.error('Init admin error:', err.message);
    res.status(500).send('Server error');
  }
};