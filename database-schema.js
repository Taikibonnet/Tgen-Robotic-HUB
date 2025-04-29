// MongoDB Database Schema for Tgen Robotics Hub

// Robot Schema - Core collection for robotics data
const RobotSchema = {
  name: String,                // Name of the robot
  slug: String,                // URL-friendly version of the name
  manufacturer: {
    name: String,              // Manufacturer name
    country: String,           // Country of origin
    website: String            // Manufacturer website
  },
  yearIntroduced: Number,      // Year the robot was first introduced
  categories: [String],        // Array of categories (e.g., "Industrial", "Humanoid", etc.)
  summary: String,             // Short description for cards and previews
  description: String,         // Full detailed description with markdown support
  
  specifications: {
    // Physical characteristics
    physical: {
      height: { value: Number, unit: String },
      width: { value: Number, unit: String },
      length: { value: Number, unit: String },
      weight: { value: Number, unit: String }
    },
    
    // Performance metrics
    performance: {
      battery: { capacity: Number, runtime: Number, chargingTime: Number },
      speed: { value: Number, unit: String },
      payload: { value: Number, unit: String },
      degreesOfFreedom: Number,
      maxIncline: Number,
      operatingTemperature: { min: Number, max: Number, unit: String }
    },
    
    // Sensors and connectivity
    sensors: [{ type: String, description: String }],
    connectivity: [String],
    ipRating: String,
    customFields: [{ name: String, value: String }]  // For robot-specific specs
  },
  
  // Media content
  media: {
    featuredImage: {
      url: String,
      alt: String,
      caption: String
    },
    images: [{
      url: String,
      alt: String,
      caption: String
    }],
    videos: [{
      url: String,
      title: String,
      description: String,
      thumbnail: String
    }]
  },
  
  // Applications and use cases
  applications: [{
    title: String,
    description: String,
    image: String
  }],
  
  // Related content
  relatedRobots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Robot' }],
  
  // SEO and metadata
  metaData: {
    title: String,
    description: String,
    keywords: [String]
  },
  
  // System fields
  status: { type: String, enum: ['draft', 'published', 'archived'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Statistics and metrics
  stats: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  }
};

// User Schema - For both regular users and administrators
const UserSchema = {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ['user', 'editor', 'admin'], default: 'user' },
  profileImage: String,
  
  // User preferences
  preferences: {
    theme: { type: String, default: 'dark' },
    favoriteCategories: [String],
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  
  // User engagement
  activity: {
    favoriteRobots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Robot' }],
    recentlyViewed: [{
      robot: { type: mongoose.Schema.Types.ObjectId, ref: 'Robot' },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  
  // For password reset functionality
  resetPasswordToken: String,
  resetPasswordExpires: Date
};

// Review Schema - For user reviews and ratings of robots
const ReviewSchema = {
  robot: { type: mongoose.Schema.Types.ObjectId, ref: 'Robot', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  content: String,
  
  // Helpful/Not helpful votes from other users
  votes: {
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    voters: [{ user: mongoose.Schema.Types.ObjectId, helpful: Boolean }]
  },
  
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// News Schema - For robotics news articles
const NewsSchema = {
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  summary: String,
  featuredImage: {
    url: String,
    alt: String
  },
  
  // Categorization
  categories: [String],
  tags: [String],
  
  // Related content
  relatedRobots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Robot' }],
  relatedNews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'News' }],
  
  // Publication details
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // SEO
  metaData: {
    title: String,
    description: String,
    keywords: [String]
  },
  
  // Statistics
  stats: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  }
};

// Category Schema - For organizing robots by type
const CategorySchema = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Comment Schema - For discussions on robots and news
const CommentSchema = {
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Comments can be on robots or news articles
  commentOn: {
    type: { type: String, enum: ['robot', 'news'], required: true },
    id: { type: mongoose.Schema.Types.ObjectId, required: true }
  },
  
  // For threaded comments
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// Media Library Schema - For managing uploaded files
const MediaSchema = {
  fileName: { type: String, required: true },
  originalName: String,
  fileType: { type: String, required: true },
  mimeType: String,
  size: Number,
  url: { type: String, required: true },
  
  // For images
  dimensions: {
    width: Number,
    height: Number
  },
  
  // For videos
  duration: Number,
  
  // Metadata
  alt: String,
  caption: String,
  
  // Organization
  tags: [String],
  
  // Usage tracking
  usedIn: [{
    type: { type: String, enum: ['robot', 'news', 'category'] },
    id: mongoose.Schema.Types.ObjectId
  }],
  
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
};

// AI Assistant Conversation Schema - For storing user interactions with the AI guide
const ConversationSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: String,  // For anonymous users
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  context: {
    currentRobot: { type: mongoose.Schema.Types.ObjectId, ref: 'Robot' },
    currentPage: String,
    searchQuery: String
  },
  startedAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false }
};

// Analytics Schema - For tracking user behavior and site performance
const AnalyticsSchema = {
  date: { type: Date, default: Date.now, required: true },
  
  // Page views
  pageViews: {
    total: { type: Number, default: 0 },
    byPage: [{
      path: String,
      views: Number
    }],
    byRobot: [{
      robot: { type: mongoose.Schema.Types.ObjectId, ref: 'Robot' },
      views: Number
    }]
  },
  
  // User metrics
  users: {
    total: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    returning: { type: Number, default: 0 }
  },
  
  // Search metrics
  search: {
    total: { type: Number, default: 0 },
    topQueries: [{
      query: String,
      count: Number
    }],
    noResults: [{
      query: String,
      count: Number
    }]
  },
  
  // AI Assistant usage
  aiAssistant: {
    conversations: { type: Number, default: 0 },
    averageDuration: Number,
    topQuestions: [{
      question: String,
      count: Number
    }]
  }
};
