import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { isAuth } from '../middlewares/auth.middleware.js';

const userRoutes = express.Router();

userRoutes.get('/me', isAuth, getProfile);
userRoutes.put('/me', isAuth, updateProfile);

export default userRoutes;
