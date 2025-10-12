// src/routes/user.routes.js
import express from 'express';
import { getProfile, updateProfile, getUserById } from '../controllers/user.controller.js';
import { isAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', isAuth, getProfile);

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', isAuth, updateProfile);

// @route   GET /api/users/:id
// @desc    Get user profile by ID (for admins)
// @access  Private (should be Admin)
// Note: We should add an isAdmin middleware here in a real application
router.get('/:id', isAuth, getUserById);

export default router;