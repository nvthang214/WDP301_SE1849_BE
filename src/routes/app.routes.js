// app.routes.js
import express from "express";
import jobRoutes from "./job.routes.js";
import companyRoutes from "./company.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";

const appRoutes = express.Router();

appRoutes.use("/auth", authRoutes);

appRoutes.use("/jobs", jobRoutes);

appRoutes.use("/companies", companyRoutes);

// Admin routes
appRoutes.use("/admin", adminRoutes);

export default appRoutes;
