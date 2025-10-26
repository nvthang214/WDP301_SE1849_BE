import express from "express";
import { getPublicStats } from "../controllers/admin.controller.js";

const publicRoutes = express.Router();

// Public routes (no auth required)
publicRoutes.get("/stats", getPublicStats); // GET /api/public/stats

export default publicRoutes;

