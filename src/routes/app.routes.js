// app.routes.js
import express from "express";
import jobRoutes from "./job.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import appstatusRoutes from "./appstatus.routes.js";
import companyRoutes from "./company.routes.js";


const appRoutes = express.Router();

// import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import applicationRoutes from './application.routes.js';
import candidateRoutes from './candidate.routes.js';
import candidateDashboardRoutes from './candidate-dashboard.routes.js';
import candidateSettingsRoutes from './candidate-settings.routes.js';

// appRoutes.use("/auth", authRoutes);
appRoutes.use('/users', userRoutes);
appRoutes.use('/applications', applicationRoutes);
appRoutes.use('/candidates', candidateRoutes);
appRoutes.use('/candidate-dashboard', candidateDashboardRoutes);
appRoutes.use('/candidate-settings', candidateSettingsRoutes);
appRoutes.use('/jobs', jobRoutes);
appRoutes.use("/auth", authRoutes);


// Admin routes
appRoutes.use("/admin", adminRoutes);
appRoutes.use("/applications", appstatusRoutes);
appRoutes.use("/companies", companyRoutes);

export default appRoutes;
