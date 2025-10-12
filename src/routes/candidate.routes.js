// src/routes/candidate.routes.js
import express from 'express';
import { getCandidates } from '../controllers/candidate.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/candidates
// @desc    Get all candidates
// @access  Private/Recruiter
router.get('/', authMiddleware, getCandidates);

export default router;
