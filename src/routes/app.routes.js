// app.routes.js
import express from "express";
import jobRoutes from "./job.routes.js";
import tagRoutes from "./tag.routes.js";
import categoryRoutes from "./category.routes.js";
import companyRoutes from "./company.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import appstatusRoutes from "./appstatus.routes.js";
import candidateRoutes from "./candidate.routes.js";
import recruiterRoutes from "./recruiter.routes.js";
import uploadRoutes from "./upload.routes.js";


const appRoutes = express.Router();

// import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import applicationRoutes from './application.routes.js';
import upgradeRequestRoutes from './upgradeRequest.routes.js';


// appRoutes.use("/auth", authRoutes);
appRoutes.use("/auth", authRoutes);

appRoutes.use('/users', userRoutes);
appRoutes.use('/candidates', candidateRoutes);

appRoutes.use('/applications', applicationRoutes);
appRoutes.use('/uploads', uploadRoutes);

appRoutes.use('/upgrade-requests', upgradeRequestRoutes);

// Job routes
appRoutes.use('/jobs', jobRoutes);
// Tag routes
appRoutes.use('/tags', tagRoutes);
// Category routes
appRoutes.use('/categories', categoryRoutes);
// Company routes
appRoutes.use('/companies', companyRoutes);

// Admin routes
appRoutes.use("/admin", adminRoutes);
appRoutes.use("/applications", appstatusRoutes);
appRoutes.use("/companies", companyRoutes);

// Recruiter routes
appRoutes.use("/recruiter", recruiterRoutes);

export default appRoutes;
