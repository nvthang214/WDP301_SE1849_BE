// app.routes.js
import express from "express";
const appRoutes = express.Router();
import authRoutes from "./auth.routes.js";
appRoutes.use("/auth", authRoutes);

export default appRoutes;
