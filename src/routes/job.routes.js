// src/routes/job.routes.js
import express from 'express';
import { getCandidates } from '../controllers/candidate.controller.js';
import { isAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/jobs/:jobId/candidates
// @desc    Get candidates for a specific job, with optional search and filter
// @access  Private/Recruiter
router.get('/:jobId/candidates', isAuth, getCandidates);

// Other job-related routes can be added here later

export default router;