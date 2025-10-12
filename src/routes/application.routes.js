// src/routes/application.routes.js
import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
// // router.use(authMiddleware);


export default router;
