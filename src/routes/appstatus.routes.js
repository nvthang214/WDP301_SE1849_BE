import express from 'express';
import { viewApplicationStatus, importCV, deleteCV } from '../controllers/appstatus.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// View the status of submitted job applications
router.get('/application-status', authMiddleware, viewApplicationStatus);

// Import (create) a new CV for applying job
router.post('/cv', authMiddleware, importCV);

// Delete own existing CV
router.delete('/cv', authMiddleware, deleteCV);

export default router;
