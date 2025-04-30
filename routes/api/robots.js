// routes/api/robots.js
const express = require('express');
const router = express.Router();
const robotController = require('../../controllers/robotController');
const auth = require('../../middleware/auth');
const adminCheck = require('../../middleware/adminCheck');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = './uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
});

// Configure multer fields for robot uploads
const robotUpload = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]);

// Special routes that need to be defined before the :id route
// @route   GET api/robots/categories
// @desc    Get robot categories with counts
// @access  Public
router.get('/categories', robotController.getCategories);

// @route   GET api/robots/popular
// @desc    Get popular robots
// @access  Public
router.get('/popular', robotController.getPopularRobots);

// @route   GET api/robots/stats
// @desc    Get robot statistics for admin dashboard
// @access  Private (Admin only)
router.get('/stats', [auth, adminCheck], robotController.getRobotStats);

// Standard CRUD routes
// @route   GET api/robots
// @desc    Get all robots with pagination
// @access  Public
router.get('/', robotController.getRobots);

// @route   GET api/robots/:id
// @desc    Get single robot by ID or slug
// @access  Public
router.get('/:id', robotController.getRobot);

// @route   GET api/robots/:id/related
// @desc    Get related robots
// @access  Public
router.get('/:id/related', robotController.getRelatedRobots);

// @route   POST api/robots
// @desc    Create a new robot
// @access  Private (Admin only)
router.post('/', [auth, adminCheck, robotUpload], robotController.createRobot);

// @route   PUT api/robots/:id
// @desc    Update a robot
// @access  Private (Admin only)
router.put('/:id', [auth, adminCheck, robotUpload], robotController.updateRobot);

// @route   DELETE api/robots/:id
// @desc    Delete a robot
// @access  Private (Admin only)
router.delete('/:id', [auth, adminCheck], robotController.deleteRobot);

module.exports = router;