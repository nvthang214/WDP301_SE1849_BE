// app.routes.js
import express from "express";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";

const appRoutes = express.Router();

// Auth routes
appRoutes.use("/auth", authRoutes);

// Admin routes
appRoutes.use("/admin", adminRoutes);

export default appRoutes;
