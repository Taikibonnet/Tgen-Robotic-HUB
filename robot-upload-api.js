// server/routes/api/robots.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Robot = require('../../models/Robot');
const auth = require('../../middleware/auth');
const adminCheck = require('../../middleware/adminCheck');
const sharp = require('sharp');
const slugify = require('slugify');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Configure multer for local storage (temporary before S3 upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for videos
  }
});

// Helper function to upload file to S3
const uploadToS3 = async (file, type) => {
  const fileStream = fs.createReadStream(file.path);
  
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${type}/${path.basename(file.path)}`,
    Body: fileStream,
    ContentType: file.mimetype
  };
  
  const result = await s3.upload(uploadParams).promise();
  
  // Delete the local file after successful upload
  fs.unlinkSync(file.path);
  
  return result.Location;
};

// Helper function to process image (resize, compress)
const processImage = async (filePath, targetPath, width) => {
  await sharp(filePath)
    .resize(width)
    .jpeg({ quality: 80 })
    .toFile(targetPath);
  
  return targetPath;
};

// @route   POST api/robots
// @desc    Create a new robot
// @access  Private (Admin only)
router.post('/', [auth, adminCheck], upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      yearIntroduced,
      categories,
      summary,
      description,
      specifications,
      applications,
      metaData
    } = req.body;
    
    // Validate required fields
    if (!name || !manufacturer) {
      return res.status(400).json({ msg: 'Name and manufacturer are required' });
    }
    
    // Create slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    // Check if robot with this slug already exists
    const existingRobot = await Robot.findOne({ slug });
    if (existingRobot) {
      return res.status(400).json({ msg: 'A robot with this name already exists' });
    }
    
    // Process and upload files
    const mediaData = {
      featuredImage: {},
      images: [],
      videos: []
    };
    
    // Process featured image
    if (req.files.featuredImage && req.files.featuredImage[0]) {
      const file = req.files.featuredImage[0];
      const s3Url = await uploadToS3(file, 'robots/featured');
      
      mediaData.featuredImage = {
        url: s3Url,
        alt: `${name} - ${manufacturer}`,
        caption: `${name} by ${manufacturer}`
      };
    }
    
    // Process additional images
    if (req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        const s3Url = await uploadToS3(file, 'robots/images');
        
        mediaData.images.push({
          url: s3Url,
          alt: `${name} - ${file.originalname.split('.')[0]}`,
          caption: ''
        });
      }
    }
    
    // Process videos
    if (req.files.videos && req.files.videos.length > 0) {
      for (const file of req.files.videos) {
        const s3Url = await uploadToS3(file, 'robots/videos');
        
        mediaData.videos.push({
          url: s3Url,
          title: `${name} - ${file.originalname.split('.')[0]}`,
          description: '',
          thumbnail: '' // Would need separate processing for video thumbnails
        });
      }
    }
    
    // Parse JSON fields that come as strings from form data
    const parsedCategories = categories ? JSON.parse(categories) : [];
    const parsedSpecifications = specifications ? JSON.parse(specifications) : {};
    const parsedApplications = applications ? JSON.parse(applications) : [];
    const parsedMetaData = metaData ? JSON.parse(metaData) : {};
    
    // Create new robot
    const newRobot = new Robot({
      name,
      slug,
      manufacturer: typeof manufacturer === 'string' ? { name: manufacturer } : manufacturer,
      yearIntroduced: parseInt(yearIntroduced) || new Date().getFullYear(),
      categories: parsedCategories,
      summary,
      description,
      specifications: parsedSpecifications,
      applications: parsedApplications,
      media: mediaData,
      metaData: parsedMetaData,
      status: 'published',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    const robot = await newRobot.save();
    
    res.json(robot);
  } catch (err) {
    console.error('Error creating robot:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/robots
// @desc    Get all robots with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { status: 'published' };
    
    // Add category filter if provided
    if (req.query.category) {
      filter.categories = req.query.category;
    }
    
    // Add manufacturer filter if provided
    if (req.query.manufacturer) {
      filter['manufacturer.name'] = req.query.manufacturer;
    }
    
    // Add search filter if provided
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { summary: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await Robot.countDocuments(filter);
    
    // Get robots
    const robots = await Robot.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name slug manufacturer categories summary media.featuredImage createdAt stats');
    
    res.json({
      robots,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching robots:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/robots/:slug
// @desc    Get robot by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const robot = await Robot.findOne({ 
      slug: req.params.slug,
      status: 'published'
    });
    
    if (!robot) {
      return res.status(404).json({ msg: 'Robot not found' });
    }
    
    // Increment view count
    robot.stats.views += 1;
    await robot.save();
    
    res.json(robot);
  } catch (err) {
    console.error('Error fetching robot:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/robots/:id
// @desc    Update a robot
// @access  Private (Admin only)
router.put('/:id', [auth, adminCheck], upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      yearIntroduced,
      categories,
      summary,
      description,
      specifications,
      applications,
      metaData
    } = req.body;
    
    // Find robot
    const robot = await Robot.findById(req.params.id);
    
    if (!robot) {
      return res.status(404).json({ msg: 'Robot not found' });
    }
    
    // If name is changed, update slug
    if (name && name !== robot.name) {
      const newSlug = slugify(name, { lower: true, strict: true });
      
      // Check if new slug already exists (excluding this robot)
      const existingRobot = await Robot.findOne({
        slug: newSlug,
        _id: { $ne: req.params.id }
      });
      
      if (existingRobot) {
        return res.status(400).json({ msg: 'A robot with this name already exists' });
      }
      
      robot.slug = newSlug;
    }
    
    // Process and upload new files if provided
    if (req.files) {
      // Process featured image
      if (req.files.featuredImage && req.files.featuredImage[0]) {
        const file = req.files.featuredImage[0];
        const s3Url = await uploadToS3(file, 'robots/featured');
        
        robot.media.featuredImage = {
          url: s3Url,
          alt: `${name || robot.name} - ${manufacturer || robot.manufacturer.name}`,
          caption: `${name || robot.name} by ${manufacturer || robot.manufacturer.name}`
        };
      }
      
      // Process additional images
      if (req.files.images && req.files.images.length > 0) {
        const newImages = [];
        
        for (const file of req.files.images) {
          const s3Url = await uploadToS3(file, 'robots/images');
          
          newImages.push({
            url: s3Url,
            alt: `${name || robot.name} - ${file.originalname.split('.')[0]}`,
            caption: ''
          });
        }
        
        // Append new images or replace existing ones based on query parameter
        if (req.query.replaceImages === 'true') {
          robot.media.images = newImages;
        } else {
          robot.media.images = [...robot.media.images, ...newImages];
        }
      }
      
      // Process videos
      if (req.files.videos && req.files.videos.length > 0) {
        const newVideos = [];
        
        for (const file of req.files.videos) {
          const s3Url = await uploadToS3(file, 'robots/videos');
          
          newVideos.push({
            url: s3Url,
            title: `${name || robot.name} - ${file.originalname.split('.')[0]}`,
            description: '',
            thumbnail: ''
          });
        }
        
        // Append new videos or replace existing ones based on query parameter
        if (req.query.replaceVideos === 'true') {
          robot.media.videos = newVideos;
        } else {
          robot.media.videos = [...robot.media.videos, ...newVideos];
        }
      }
    }
    
    // Update fields if provided
    if (name) robot.name = name;
    if (manufacturer) {
      robot.manufacturer = typeof manufacturer === 'string' 
        ? { name: manufacturer } 
        : manufacturer;
    }
    if (yearIntroduced) robot.yearIntroduced = parseInt(yearIntroduced);
    if (categories) {
      const parsedCategories = typeof categories === 'string' 
        ? JSON.parse(categories) 
        : categories;
      robot.categories = parsedCategories;
    }
    if (summary) robot.summary = summary;
    if (description) robot.description = description;
    if (specifications) {
      const parsedSpecifications = typeof specifications === 'string' 
        ? JSON.parse(specifications) 
        : specifications;
      robot.specifications = parsedSpecifications;
    }
    if (applications) {
      const parsedApplications = typeof applications === 'string' 
        ? JSON.parse(applications) 
        : applications;
      robot.applications = parsedApplications;
    }
    if (metaData) {
      const parsedMetaData = typeof metaData === 'string' 
        ? JSON.parse(metaData) 
        : metaData;
      robot.metaData = parsedMetaData;
    }
    
    // Update tracking fields
    robot.updatedBy = req.user.id;
    robot.updatedAt = Date.now();
    
    const updatedRobot = await robot.save();
    
    res.json(updatedRobot);
  } catch (err) {
    console.error('Error updating robot:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/robots/:id
// @desc    Delete a robot
// @access  Private (Admin only)
router.delete('/:id', [auth, adminCheck], async (req, res) => {
  try {
    const robot = await Robot.findById(req.params.id);
    
    if (!robot) {
      return res.status(404).json({ msg: 'Robot not found' });
    }
    
    // Option to soft delete instead of permanent deletion
    if (req.query.soft === 'true') {
      robot.status = 'archived';
      await robot.save();
      return res.json({ msg: 'Robot archived' });
    }
    
    // Delete associated media from S3
    const deleteFromS3 = async (url) => {
      if (!url) return;
      
      try {
        const key = url.split('/').slice(3).join('/');
        
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key
        }).promise();
      } catch (error) {
        console.error('Error deleting from S3:', error);
      }
    };
    
    // Delete featured image
    if (robot.media.featuredImage && robot.media.featuredImage.url) {
      await deleteFromS3(robot.media.featuredImage.url);
    }
    
    // Delete additional images
    for (const image of robot.media.images) {
      if (image.url) {
        await deleteFromS3(image.url);
      }
    }
    
    // Delete videos
    for (const video of robot.media.videos) {
      if (video.url) {
        await deleteFromS3(video.url);
      }
      if (video.thumbnail) {
        await deleteFromS3(video.thumbnail);
      }
    }
    
    // Delete the robot document
    await robot.remove();
    
    res.json({ msg: 'Robot deleted' });
  } catch (err) {
    console.error('Error deleting robot:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;