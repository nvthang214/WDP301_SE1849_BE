import User from '../models/User.js';
import Role from '../models/Role.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Category from '../models/Category.js';
import Recruiter from '../models/Recruiter.js';
import mongoose from 'mongoose';

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

    console.log('Update role request:', { userId, roleId });

    // Validate input
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'roleId is required'
      });
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    console.log('Found role:', role);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    console.log('Found user:', user);
    
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

    console.log('User updated successfully:', user);

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

// Get all jobs (for admin) - Simple version without complex populate
export const getAllJobs = async (req, res) => {
  try {
    console.log('Getting all jobs...');
    
    // Lấy jobs đơn giản trước
    const jobs = await Job.find();
    console.log('Jobs found:', jobs.length);

    // Populate từng phần một cách an toàn
    const jobsWithPopulate = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject();
        
        // Populate company
        if (job.company_id) {
          const company = await Company.findById(job.company_id);
          jobObj.company_id = company ? {_id: company._id, name: company.name} : null;
        }
        
        // Populate category
        if (job.category_id) {
          const category = await Category.findById(job.category_id);
          jobObj.category_id = category ? {_id: category._id, name: category.name} : null;
        }
        
        // Populate recruiter
        if (job.recruiter_id) {
          const recruiter = await Recruiter.findById(job.recruiter_id);
          if (recruiter && recruiter.user_id) {
            const user = await User.findById(recruiter.user_id);
            jobObj.recruiter_id = user ? {
              _id: recruiter._id,
              FullName: user.FullName,
              Email: user.Email
            } : null;
          } else {
            jobObj.recruiter_id = null;
          }
        }
        
        return jobObj;
      })
    );

    console.log('Jobs with populate completed');

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: jobsWithPopulate
    });

  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Toggle job visibility (active/inactive)
export const toggleJobVisibility = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job is now ${job.isActive ? 'active' : 'inactive'}`,
      data: { jobId: job._id, isActive: job.isActive }
    });

  } catch (error) {
    console.error('Error toggling job visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a job
export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: { jobId: job._id }
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

