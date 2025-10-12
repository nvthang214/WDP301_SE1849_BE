// app.routes.js
import express from "express";
const appRoutes = express.Router();

import userRoutes from './user.routes.js';
import jobRoutes from './job.routes.js';

appRoutes.use("/auth", () => {});
appRoutes.use('/users', userRoutes);
appRoutes.use('/jobs', jobRoutes);

export default appRoutes;
