// app.routes.js
import express from "express";
const appRoutes = express.Router();

// import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import applicationRoutes from './application.routes.js';
import candidateRoutes from './candidate.routes.js';
import jobRoutes from './job.routes.js';

// appRoutes.use("/auth", authRoutes);
appRoutes.use('/users', userRoutes);
appRoutes.use('/applications', applicationRoutes);
appRoutes.use('/candidates', candidateRoutes);
appRoutes.use('/jobs', jobRoutes);

export default appRoutes;
