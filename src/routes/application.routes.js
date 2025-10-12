// src/routes/application.routes.js
import express from 'express';
import { updateApplicationStatus } from '../controllers/application.controller.js';
import { isAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   PATCH /api/applications/:id
// @desc    Update application status
// @access  Private/Recruiter
router.patch('/:id', isAuth, updateApplicationStatus);

export default router;
