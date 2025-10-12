// app.routes.js
import express from "express";
import jobRoutes from "./job.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import appstatusRoutes from "./appstatus.routes.js";


const appRoutes = express.Router();

appRoutes.use("/auth", authRoutes);

appRoutes.use("/jobs", jobRoutes);

// Admin routes
appRoutes.use("/admin", adminRoutes);
appRoutes.use("/status", appstatusRoutes);





export default appRoutes;
