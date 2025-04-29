// server/models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema Definition
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'editor', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String
  },
  
  // User preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark'
    },
    favoriteCategories: [String],
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // User engagement
  activity: {
    favoriteRobots: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Robot'
    }],
    recentlyViewed: [{
      robot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Robot'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // For password reset functionality
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // For email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Registration and login dates
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Pre-save hook to hash the password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

// Method to generate JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Method to generate a password reset token
UserSchema.methods.generatePasswordResetToken = async function() {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set token expiry time (1 hour)
  this.resetPasswordExpires = Date.now() + 3600000;
  
  // Save the user
  await this.save({ validateBeforeSave: false });
  
  return resetToken;
};

// Method to generate an email verification token
UserSchema.methods.generateEmailVerificationToken = async function() {
  // Generate a random token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set token expiry time (24 hours)
  this.emailVerificationExpires = Date.now() + 86400000;
  
  // Save the user
  await this.save({ validateBeforeSave: false });
  
  return verificationToken;
};

// Method to add a robot to favorites
UserSchema.methods.addToFavorites = async function(robotId) {
  // Check if robot is already in favorites
  if (this.activity.favoriteRobots.includes(robotId)) {
    return this;
  }
  
  // Add to favorites
  this.activity.favoriteRobots.push(robotId);
  
  // Save the user
  await this.save();
  
  return this;
};

// Method to remove a robot from favorites
UserSchema.methods.removeFromFavorites = async function(robotId) {
  // Filter out the robot ID
  this.activity.favoriteRobots = this.activity.favoriteRobots.filter(
    id => id.toString() !== robotId.toString()
  );
  
  // Save the user
  await this.save();
  
  return this;
};

// Method to add a robot to recently viewed
UserSchema.methods.addToRecentlyViewed = async function(robotId) {
  // Remove if already exists (to move it to the top)
  this.activity.recentlyViewed = this.activity.recentlyViewed.filter(
    item => item.robot.toString() !== robotId.toString()
  );
  
  // Add to the beginning of recently viewed
  this.activity.recentlyViewed.unshift({
    robot: robotId,
    timestamp: Date.now()
  });
  
  // Keep only the 10 most recent
  if (this.activity.recentlyViewed.length > 10) {
    this.activity.recentlyViewed = this.activity.recentlyViewed.slice(0, 10);
  }
  
  // Save the user
  await this.save();
  
  return this;
};

// Static method to find or create a user (for social login)
UserSchema.statics.findOrCreate = async function(userData) {
  try {
    // Try to find user by email
    let user = await this.findOne({ email: userData.email });
    
    // If user doesn't exist, create a new one
    if (!user) {
      user = new this({
        email: userData.email,
        password: crypto.randomBytes(20).toString('hex'), // Generate random password
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profileImage: userData.profileImage || '',
        isEmailVerified: true // Consider emails from social providers as verified
      });
      
      await user.save();
    }
    
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

// Indexes for faster querying
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'activity.favoriteRobots': 1 });

module.exports = mongoose.model('User', UserSchema);
