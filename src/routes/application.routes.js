// src/routes/application.routes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { recruiterMiddleware } from "../middlewares/recruiter.middleware.js";
import { wrapAsync } from "../middlewares/error.middleware.js";
import {
  getCandidatesInJob,
  filterCandidatesByStatus,
  applyForJob,
  getAllApplicationsByRecruiter,
  getShortlistedApplicationsByRecruiter,
  //   getAllApplications,
  //   updateApplicationStatus,
} from "../controllers/application.controller.js";

const router = express.Router();
router.use(authMiddleware, recruiterMiddleware);

// Recruiter routes
// router.get('/applications', wrapAsync(getAllApplications));
// router.put("/applications/:applicationId/status", wrapAsync(updateApplicationStatus));

// Get all applications for recruiter's company
router.get("/", wrapAsync(getAllApplicationsByRecruiter));

// Get shortlisted applications for recruiter's company
router.get("/shortlisted", wrapAsync(getShortlistedApplicationsByRecruiter));

// Get candidates for specific job
router.get("/jobs/:jobId/candidates", wrapAsync(getCandidatesInJob));
router.get("/jobs/:jobId/candidates/filter", wrapAsync(filterCandidatesByStatus));

// Apply for a job - support both POST and GET methods (auth temporarily disabled for testing)
// router.post('/jobs/:jobId/apply', wrapAsync(applyForJob));
router.get("/jobs/:jobId/apply", wrapAsync(applyForJob));

export default router;
