// app.routes.js
import express from "express";
import jobRoutes from "./job.routes.js";
import tagRoutes from "./tag.routes.js";
import categoryRoutes from "./category.routes.js";
import companyRoutes from "./company.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import appstatusRoutes from "./appstatus.routes.js";

const appRoutes = express.Router();

// import authRoutes from './auth.routes.js';
import userRoutes from "./user.routes.js";
import applicationRoutes from "./application.routes.js";

// appRoutes.use("/auth", authRoutes);
appRoutes.use("/auth", authRoutes);

appRoutes.use("/users", userRoutes);

appRoutes.use("/applications", applicationRoutes);

// Job routes
appRoutes.use("/jobs", jobRoutes);
// Tag routes
appRoutes.use("/tags", tagRoutes);
// Category routes
appRoutes.use("/categories", categoryRoutes);
// Company routes
appRoutes.use("/companies", companyRoutes);

// Admin routes
appRoutes.use("/admin", adminRoutes);
appRoutes.use("/applications", appstatusRoutes);
appRoutes.use("/companies", companyRoutes);

export default appRoutes;
