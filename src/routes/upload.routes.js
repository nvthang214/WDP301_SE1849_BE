import express from "express";
import {
	addCandidateCv,
	deleteCandidateCv,
	getCandidateCv,
	updateCandidateCv,
} from "../controllers/upload.controller.js";
import upload from "../lib/cloudinary/multer.js";
import { wrapAsync } from "../middlewares/error.middleware.js";

const uploadRoutes = express.Router();

uploadRoutes.get("/cv/:userId", wrapAsync(getCandidateCv));
uploadRoutes.post("/cv/:userId", upload.single("cv"), wrapAsync(addCandidateCv));
uploadRoutes.put("/cv/:userId", upload.single("cv"), wrapAsync(updateCandidateCv));
uploadRoutes.delete("/cv/:userId", wrapAsync(deleteCandidateCv));

export default uploadRoutes;
