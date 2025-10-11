import express from 'express';
import { login, register, verifyToken } from '../controllers/authController.js';

const authRoutes = express.Router();

// Auth routes
authRoutes.post('/login', login);                    // POST /api/auth/login
authRoutes.post('/register', register);              // POST /api/auth/register
authRoutes.get('/verify', verifyToken);             // GET /api/auth/verify

export default authRoutes;

