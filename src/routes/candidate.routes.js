import express from "express";
import {
    getCandidateProfile,
    createCandidateProfile,
    updateCandidateProfile,
    getCandidateSocial,
    addCandidateSocial,
    updateCandidateSocial,
    deleteCandidateSocial,
    getInfoCandidate,
    updateInfoCandidate,
    getCandidateAppliedJobs
} from "../controllers/candidate.controller.js";
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';

const candidateRoutes = express.Router();
candidateRoutes.use(authMiddleware);

candidateRoutes.get("/profile/:userId", wrapAsync(getCandidateProfile));
candidateRoutes.post("/profile/:userId", wrapAsync(createCandidateProfile));
candidateRoutes.put("/profile/:userId", wrapAsync(updateCandidateProfile));

candidateRoutes.get("/social/:userId", wrapAsync(getCandidateSocial));
candidateRoutes.post("/social/:userId", wrapAsync(addCandidateSocial));
candidateRoutes.put("/social/:userId", wrapAsync(updateCandidateSocial));
candidateRoutes.delete("/social/:userId", wrapAsync(deleteCandidateSocial));

candidateRoutes.get("/applied-jobs/:userId", wrapAsync(getCandidateAppliedJobs));
candidateRoutes.get("/info/:userId", wrapAsync(getInfoCandidate));
candidateRoutes.put("/info/:userId", wrapAsync(updateInfoCandidate));

export default candidateRoutes;
