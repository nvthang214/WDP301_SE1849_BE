// app.routes.js
import express from "express";
import jobRoutes from "./job.routes.js";
const appRoutes = express.Router();

appRoutes.use("/auth", () => {});
appRoutes.use("/jobs", jobRoutes);
export default appRoutes;
