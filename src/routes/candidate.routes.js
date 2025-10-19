import express from "express";
import { getCandidateSocial,
    addCandidateSocial,
    updateCandidateSocial,
    deleteCandidateSocial
} from "../controllers/candidate.controller.js";

const router = express.Router();

router.get("/social/:userId", getCandidateSocial);
router.post("/social/:userId", addCandidateSocial);
router.put("/social/:userId", updateCandidateSocial);
router.delete("/social/:userId", deleteCandidateSocial);


export default router;
