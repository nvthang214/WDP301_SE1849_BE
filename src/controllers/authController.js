import User from '../models/User.js';
import Role from '../models/Role.js';
import jwt from 'jsonwebtoken';

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ Email: email }).populate('role_id', 'name');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password (simple comparison - in production, use bcrypt)
    if (user.Password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.IsActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is banned'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.Email,
        role: user.Role,
        roleId: user.role_id._id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.Email,
          fullName: user.FullName,
          role: user.Role,
          roleId: user.role_id._id,
          phoneNumber: user.phone_number,
          isActive: user.IsActive
        }
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Register function (optional)
export const register = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber, roleName = 'user' } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ Email: email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Find role by name
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role name'
      });
    }

    // Create new user
    const newUser = new User({
      Email: email,
      Password: password,
      FullName: fullName,
      phone_number: phoneNumber,
      Role: roleName,
      role_id: role._id,
      IsActive: true
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser._id,
        email: newUser.Email,
        fullName: newUser.FullName,
        role: newUser.Role,
        phoneNumber: newUser.phone_number,
        isActive: newUser.IsActive
      }
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify token function
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user info
    const user = await User.findById(decoded.userId).populate('role_id', 'name');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        id: user._id,
        email: user.Email,
        fullName: user.FullName,
        role: user.Role,
        roleId: user.role_id._id,
        phoneNumber: user.phone_number,
        isActive: user.IsActive
      }
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
};

