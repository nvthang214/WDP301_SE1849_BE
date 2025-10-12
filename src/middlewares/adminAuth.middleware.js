import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to check if user is admin using JWT
export const checkAdminRole = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId).populate('role_id', 'name');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.IsActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is banned'
      });
    }

    // Check if user has admin role
    if (user.Role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required'
      });
    }

    // Add user info to request for use in controllers
    req.adminUser = user;
    next();

  } catch (error) {
    console.error('Error checking admin role:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// General auth middleware (for any authenticated user)
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId).populate('role_id', 'name');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.IsActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is banned'
      });
    }

    // Add user info to request for use in controllers
    req.user = user;
    next();

  } catch (error) {
    console.error('Error authenticating token:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
