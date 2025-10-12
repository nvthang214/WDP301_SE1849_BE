// app.routes.js
import express from "express";
import jobRoutes from "./job.routes.js";
const appRoutes = express.Router();
import authRoutes from "./auth.routes.js";
appRoutes.use("/auth", authRoutes);
appRoutes.use("/jobs", jobRoutes);
export default appRoutes;
