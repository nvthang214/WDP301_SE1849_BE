// src/routes/application.routes.js
import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { recruiterMiddleware } from '../middlewares/recruiter.middleware.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { getCandidatesInJob, filterCandidatesByStatus, applyForJob } from '../controllers/application.controller.js';

const router = express.Router();
// router.use(authMiddleware, recruiterMiddleware);

// Recruiter routes - middleware tạm thời bị tắt để kiểm tra API
// TODO: Bật lại middleware sau khi kiểm tra xong
// router.get('/job/:jobId/candidates', wrapAsync(getCandidatesInJob));
// router.get('/job/:jobId/candidates/filter', wrapAsync(filterCandidatesByStatus));

// Direct URL format matching the request pattern
router.get('/jobs/:jobId/candidates', wrapAsync(getCandidatesInJob));
router.get('/jobs/:jobId/candidates/filter', wrapAsync(filterCandidatesByStatus));

// Apply for a job - support both POST and GET methods (auth temporarily disabled for testing)
// router.post('/jobs/:jobId/apply', wrapAsync(applyForJob));
router.get('/jobs/:jobId/apply', wrapAsync(applyForJob));

export default router;
