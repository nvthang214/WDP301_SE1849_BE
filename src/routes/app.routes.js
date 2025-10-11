// app.routes.js
import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";

const appRoutes = express.Router();

// Auth routes
appRoutes.use("/auth", authRoutes);

// Admin routes
appRoutes.use("/admin", adminRoutes);

export default appRoutes;
