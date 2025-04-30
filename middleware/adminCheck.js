// middleware/adminCheck.js
// Middleware to check if the user has admin or editor role

module.exports = function(req, res, next) {
  // Check user role
  if (req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({ msg: 'Access denied. Admin privileges required' });
  }
  
  next();
};