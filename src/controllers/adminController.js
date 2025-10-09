import User from '../models/User.js';
import Role from '../models/Role.js';

// Ban/Unban user account
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's IsActive status
    user.IsActive = isActive;
    await user.save();

    const action = isActive ? 'unbanned' : 'banned';
    res.status(200).json({
      success: true,
      message: `User has been ${action} successfully`,
      data: {
        userId: user._id,
        email: user.Email,
        fullName: user.FullName,
        isActive: user.IsActive
      }
    });

  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    // Validate input
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'roleId is required'
      });
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user's role
    user.role_id = roleId;
    user.Role = role.name;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: user._id,
        email: user.Email,
        fullName: user.FullName,
        roleId: user.role_id,
        roleName: user.Role
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all users (for admin to view)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('role_id', 'name')
      .select('-Password'); // Exclude password from response

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });

  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();

    res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles
    });

  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('role_id', 'name')
      .select('-Password'); // Exclude password from response

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
