// routes/api/users.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../../controllers/userController');
const auth = require('../../middleware/auth');
const adminCheck = require('../../middleware/adminCheck');

// @route   GET api/users/stats
// @desc    Get user statistics for admin dashboard
// @access  Private (Admin only)
router.get('/stats', [auth, adminCheck], userController.getUserStats);

// @route   GET api/users/favorites
// @desc    Get user's favorite robots
// @access  Private
router.get('/favorites', auth, userController.getFavorites);

// @route   POST api/users/favorites/:robotId
// @desc    Add robot to favorites
// @access  Private
router.post('/favorites/:robotId', auth, userController.addToFavorites);

// @route   DELETE api/users/favorites/:robotId
// @desc    Remove robot from favorites
// @access  Private
router.delete('/favorites/:robotId', auth, userController.removeFromFavorites);

// @route   GET api/users/recent
// @desc    Get user's recently viewed robots
// @access  Private
router.get('/recent', auth, userController.getRecentlyViewed);

// @route   POST api/users/recent/:robotId
// @desc    Add robot to recently viewed
// @access  Private
router.post('/recent/:robotId', auth, userController.addToRecentlyViewed);

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', [auth, adminCheck], userController.getUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or Own User)
router.get('/:id', auth, userController.getUser);

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private (Admin or Own User)
router.put(
  '/:id',
  [
    auth,
    [
      check('email', 'Please include a valid email').optional().isEmail(),
      check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 })
    ]
  ],
  userController.updateUser
);

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', [auth, adminCheck], userController.deleteUser);

module.exports = router;