// controllers/robotController.js
const Robot = require('../models/Robot');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const AWS = require('aws-sdk');
const crypto = require('crypto');

// Configure AWS S3 (using environment variables in production)
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
};

const s3 = new AWS.S3(s3Config);
const bucketName = process.env.AWS_S3_BUCKET || 'tgen-robotics-hub';

// Helper function to upload file to S3
const uploadToS3 = async (file) => {
  const fileContent = fs.readFileSync(file.path);
  // Generate unique filename to avoid collisions
  const fileExtension = path.extname(file.originalname);
  const randomString = crypto.randomBytes(16).toString('hex');
  const fileName = `robots/${randomString}${fileExtension}`;
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ContentType: file.mimetype
  };
  
  try {
    const data = await s3.upload(params).promise();
    
    // Delete local file after upload
    fs.unlinkSync(file.path);
    
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

// Helper function to delete file from S3
const deleteFromS3 = async (url) => {
  try {
    // Extract key from URL
    const urlParts = url.split('/');
    const key = urlParts.slice(3).join('/');
    
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
};

// @desc    Get all robots with pagination
// @route   GET /api/robots
// @access  Public
exports.getRobots = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    
    // Add category filter if provided
    if (req.query.category) {
      filter.categories = req.query.category;
    }
    
    // Add manufacturer filter if provided
    if (req.query.manufacturer) {
      filter['manufacturer.name'] = { $regex: req.query.manufacturer, $options: 'i' };
    }
    
    // If not admin route, only show published robots
    if (!req.query.admin) {
      filter.status = 'published';
    }
    
    // Search query
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { summary: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'manufacturer.name': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await Robot.countDocuments(filter);
    
    // Get robots with pagination
    const robots = await Robot.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      robots,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting robots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single robot by ID or slug
// @route   GET /api/robots/:id
// @access  Public
exports.getRobot = async (req, res) => {
  try {
    let robot;
    
    // Check if param is MongoDB ID or slug
    const isValidId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    
    if (isValidId) {
      // Find by ID
      robot = await Robot.findById(req.params.id);
    } else {
      // Find by slug
      robot = await Robot.findOne({ slug: req.params.id });
    }
    
    // Check if robot exists
    if (!robot) {
      return res.status(404).json({ message: 'Robot not found' });
    }
    
    // If not admin request and robot is not published, return not found
    if (!req.query.admin && robot.status !== 'published') {
      return res.status(404).json({ message: 'Robot not found' });
    }
    
    // Increment view count if this is not an admin request
    if (!req.query.admin) {
      robot.stats.views += 1;
      await robot.save();
    }
    
    res.json(robot);
  } catch (error) {
    console.error('Error getting robot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new robot
// @route   POST /api/robots
// @access  Private (Admin only)
exports.createRobot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Extract data from request body
    const {
      name,
      manufacturer,
      yearIntroduced,
      categories,
      summary,
      description,
      specifications,
      status
    } = req.body;
    
    // Validate required fields
    if (!name || !manufacturer) {
      return res.status(400).json({ message: 'Name and manufacturer are required' });
    }
    
    // Create slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    // Check if robot with this slug already exists
    const existingRobot = await Robot.findOne({ slug });
    if (existingRobot) {
      return res.status(400).json({ message: 'A robot with this name already exists' });
    }
    
    // Handle file uploads
    const mediaData = {
      featuredImage: {},
      images: [],
      videos: []
    };
    
    // Handle featured image
    if (req.files && req.files.featuredImage) {
      const file = req.files.featuredImage[0];
      const imageUrl = await uploadToS3(file);
      
      mediaData.featuredImage = {
        url: imageUrl,
        alt: name,
        caption: `${name} by ${typeof manufacturer === 'string' ? manufacturer : manufacturer.name}`
      };
    }
    
    // Handle additional images
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const imageUrl = await uploadToS3(file);
        
        mediaData.images.push({
          url: imageUrl,
          alt: name,
          caption: ''
        });
      }
    }
    
    // Parse JSON fields if needed
    let parsedCategories = categories;
    if (typeof categories === 'string') {
      try {
        parsedCategories = JSON.parse(categories);
      } catch (e) {
        parsedCategories = [categories];
      }
    }
    
    let parsedSpecifications = specifications;
    if (typeof specifications === 'string') {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        parsedSpecifications = {};
      }
    }
    
    // Create robot object
    const robotData = {
      name,
      slug,
      manufacturer: typeof manufacturer === 'string' ? { name: manufacturer } : manufacturer,
      yearIntroduced: parseInt(yearIntroduced) || new Date().getFullYear(),
      categories: Array.isArray(parsedCategories) ? parsedCategories : [parsedCategories],
      summary,
      description,
      specifications: parsedSpecifications || {},
      media: mediaData,
      status: status || 'published',
      createdBy: req.user.id,
      updatedBy: req.user.id
    };
    
    const robot = new Robot(robotData);
    await robot.save();
    
    res.status(201).json(robot);
  } catch (error) {
    console.error('Error creating robot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a robot
// @route   PUT /api/robots/:id
// @access  Private (Admin only)
exports.updateRobot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Find robot by ID
    const robot = await Robot.findById(req.params.id);
    
    if (!robot) {
      return res.status(404).json({ message: 'Robot not found' });
    }
    
    // Extract data from request body
    const {
      name,
      manufacturer,
      yearIntroduced,
      categories,
      summary,
      description,
      specifications,
      status
    } = req.body;
    
    // If name is changed, update slug
    if (name && name !== robot.name) {
      const newSlug = slugify(name, { lower: true, strict: true });
      
      // Check if new slug already exists (excluding this robot)
      const existingRobot = await Robot.findOne({
        slug: newSlug,
        _id: { $ne: robot._id }
      });
      
      if (existingRobot) {
        return res.status(400).json({ message: 'A robot with this name already exists' });
      }
      
      robot.slug = newSlug;
    }
    
    // Handle file uploads
    if (req.files) {
      // Handle featured image
      if (req.files.featuredImage) {
        const file = req.files.featuredImage[0];
        const imageUrl = await uploadToS3(file);
        
        robot.media.featuredImage = {
          url: imageUrl,
          alt: name || robot.name,
          caption: `${name || robot.name} by ${
            typeof manufacturer === 'string' 
              ? manufacturer 
              : (manufacturer?.name || robot.manufacturer.name)
          }`
        };
      }
      
      // Handle additional images
      if (req.files.images) {
        // Check if we should replace or append
        if (req.query.replaceImages === 'true') {
          robot.media.images = [];
        }
        
        for (const file of req.files.images) {
          const imageUrl = await uploadToS3(file);
          
          robot.media.images.push({
            url: imageUrl,
            alt: name || robot.name,
            caption: ''
          });
        }
      }
    }
    
    // Parse JSON fields if needed
    let parsedCategories = categories;
    if (typeof categories === 'string') {
      try {
        parsedCategories = JSON.parse(categories);
      } catch (e) {
        parsedCategories = [categories];
      }
    }
    
    let parsedSpecifications = specifications;
    if (typeof specifications === 'string') {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        parsedSpecifications = {};
      }
    }
    
    // Update robot fields
    if (name) robot.name = name;
    if (manufacturer) {
      robot.manufacturer = typeof manufacturer === 'string'
        ? { name: manufacturer }
        : manufacturer;
    }
    if (yearIntroduced) robot.yearIntroduced = parseInt(yearIntroduced);
    if (categories) {
      robot.categories = Array.isArray(parsedCategories) ? parsedCategories : [parsedCategories];
    }
    if (summary) robot.summary = summary;
    if (description) robot.description = description;
    if (specifications) {
      robot.specifications = parsedSpecifications;
    }
    if (status) robot.status = status;
    
    // Update tracking fields
    robot.updatedAt = Date.now();
    robot.updatedBy = req.user.id;
    
    const updatedRobot = await robot.save();
    
    res.json(updatedRobot);
  } catch (error) {
    console.error('Error updating robot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a robot
// @route   DELETE /api/robots/:id
// @access  Private (Admin only)
exports.deleteRobot = async (req, res) => {
  try {
    const robot = await Robot.findById(req.params.id);
    
    if (!robot) {
      return res.status(404).json({ message: 'Robot not found' });
    }
    
    // Check for soft delete option
    if (req.query.soft === 'true') {
      robot.status = 'archived';
      await robot.save();
      return res.json({ message: 'Robot archived successfully' });
    }
    
    // Delete media files from S3
    if (robot.media) {
      // Delete featured image
      if (robot.media.featuredImage && robot.media.featuredImage.url) {
        await deleteFromS3(robot.media.featuredImage.url);
      }
      
      // Delete additional images
      if (robot.media.images && robot.media.images.length > 0) {
        for (const image of robot.media.images) {
          if (image.url) {
            await deleteFromS3(image.url);
          }
        }
      }
      
      // Delete videos
      if (robot.media.videos && robot.media.videos.length > 0) {
        for (const video of robot.media.videos) {
          if (video.url) {
            await deleteFromS3(video.url);
          }
          if (video.thumbnail) {
            await deleteFromS3(video.thumbnail);
          }
        }
      }
    }
    
    // Delete the robot
    await Robot.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Robot deleted successfully' });
  } catch (error) {
    console.error('Error deleting robot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get robot categories
// @route   GET /api/robots/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    // Aggregate to get all distinct categories with count
    const categories = await Robot.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$categories' },
      { 
        $group: {
          _id: '$categories',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1, _id: 1 } }
    ]);
    
    res.json(categories.map(category => ({
      name: category._id,
      count: category.count
    })));
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get popular robots
// @route   GET /api/robots/popular
// @access  Public
exports.getPopularRobots = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const robots = await Robot.find({ status: 'published' })
      .sort({ 'stats.views': -1 })
      .limit(limit)
      .select('name slug manufacturer categories summary media.featuredImage stats');
    
    res.json(robots);
  } catch (error) {
    console.error('Error getting popular robots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get related robots
// @route   GET /api/robots/:id/related
// @access  Public
exports.getRelatedRobots = async (req, res) => {
  try {
    const robot = await Robot.findById(req.params.id);
    
    if (!robot) {
      return res.status(404).json({ message: 'Robot not found' });
    }
    
    // Get related robots based on categories
    const relatedRobots = await Robot.find({
      _id: { $ne: robot._id },
      status: 'published',
      categories: { $in: robot.categories }
    })
    .limit(3)
    .select('name slug manufacturer categories summary media.featuredImage');
    
    res.json(relatedRobots);
  } catch (error) {
    console.error('Error getting related robots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get total stats for admin dashboard
// @route   GET /api/robots/stats
// @access  Private (Admin only)
exports.getRobotStats = async (req, res) => {
  try {
    // Get total counts
    const totalRobots = await Robot.countDocuments();
    const publishedRobots = await Robot.countDocuments({ status: 'published' });
    const draftRobots = await Robot.countDocuments({ status: 'draft' });
    const archivedRobots = await Robot.countDocuments({ status: 'archived' });
    
    // Get most viewed robots
    const mostViewed = await Robot.find()
      .sort({ 'stats.views': -1 })
      .limit(5)
      .select('name slug stats.views');
    
    // Get recently added robots
    const recentlyAdded = await Robot.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name slug createdAt');
    
    // Get category distribution
    const categoryDistribution = await Robot.aggregate([
      { $unwind: '$categories' },
      { 
        $group: {
          _id: '$categories',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      counts: {
        total: totalRobots,
        published: publishedRobots,
        draft: draftRobots,
        archived: archivedRobots
      },
      mostViewed,
      recentlyAdded,
      categoryDistribution
    });
  } catch (error) {
    console.error('Error getting robot stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};