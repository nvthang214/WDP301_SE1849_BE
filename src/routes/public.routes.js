import express from "express";
import { getPublicStats } from "../controllers/admin.controller.js";
import { getTopAppliedJobs } from "../controllers/candidate.controller.js";

const publicRoutes = express.Router();

// Public routes (no auth required)
publicRoutes.get("/stats", getPublicStats); // GET /api/public/stats
publicRoutes.get("/top-applied-jobs", getTopAppliedJobs);

export default publicRoutes;

