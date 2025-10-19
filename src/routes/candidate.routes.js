import express from "express";
import {
    getCandidateProfile,
    createCandidateProfile,
    updateCandidateProfile,
    getCandidateSocial,
    addCandidateSocial,
    updateCandidateSocial,
    deleteCandidateSocial,
    getCandidateAppliedJobs
} from "../controllers/candidate.controller.js";

const router = express.Router();

router.get("/profile/:userId", getCandidateProfile);
router.post("/profile/:userId", createCandidateProfile);
router.put("/profile/:userId", updateCandidateProfile);

router.get("/social/:userId", getCandidateSocial);
router.post("/social/:userId", addCandidateSocial);
router.put("/social/:userId", updateCandidateSocial);
router.delete("/social/:userId", deleteCandidateSocial);

router.get("/applied-jobs/:userId", getCandidateAppliedJobs);


export default router;
