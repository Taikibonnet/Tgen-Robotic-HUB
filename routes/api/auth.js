// routes/api/auth.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../../controllers/authController');
const auth = require('../../middleware/auth');

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   POST api/auth/register
// @desc    Register user & get token
// @access  Public
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty()
  ],
  authController.register
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   GET api/auth/logout
// @desc    Logout user (client-side only)
// @access  Public
router.get('/logout', authController.logout);

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  authController.forgotPassword
);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password/:token',
  [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.resetPassword
);

// @route   POST api/auth/init-admin
// @desc    Initialize admin user
// @access  Public (should be protected in production)
router.post('/init-admin', authController.initAdmin);

module.exports = router;