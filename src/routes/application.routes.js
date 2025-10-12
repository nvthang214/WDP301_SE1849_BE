// src/routes/application.routes.js
import express from 'express';
import { updateApplicationStatus } from '../controllers/application.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   PATCH /api/applications/:id
// @desc    Update application status
// @access  Private/Recruiter
router.patch('/:id', authMiddleware, updateApplicationStatus);

export default router;
