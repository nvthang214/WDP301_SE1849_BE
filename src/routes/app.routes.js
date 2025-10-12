// app.routes.js
import express from "express";
import jobRoutes from "./job.routes.js";
<<<<<<< HEAD
import companyRoutes from "./company.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";

const appRoutes = express.Router();

appRoutes.use("/auth", authRoutes);

appRoutes.use("/jobs", jobRoutes);

appRoutes.use("/companies", companyRoutes);

// Admin routes
appRoutes.use("/admin", adminRoutes);
=======
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import appstatusRoutes from "./appstatus.routes.js";


const appRoutes = express.Router();

// import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import applicationRoutes from './application.routes.js';
import candidateRoutes from './candidate.routes.js';

// appRoutes.use("/auth", authRoutes);
appRoutes.use('/users', userRoutes);
appRoutes.use('/applications', applicationRoutes);
appRoutes.use('/candidates', candidateRoutes);
appRoutes.use('/jobs', jobRoutes);
appRoutes.use("/auth", authRoutes);


// Admin routes
appRoutes.use("/admin", adminRoutes);
appRoutes.use("/status", appstatusRoutes);




>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d

export default appRoutes;
