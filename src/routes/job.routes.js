import express from 'express';
// import { getCandidatesInJob } from '../controllers/job.controller.js';
// import { isAuth } from '../middlewares/auth.middleware.js';

const jobRoutes = express.Router();

// Recruiter can view, search, and filter candidates in a job
// jobRoutes.get('/:jobId/candidates', isAuth, getCandidatesInJob);

export default jobRoutes;
