import express from 'express';
import {
  banUser,
  updateUserRole,
  getAllUsers,
  getAllRoles,
  getUserById,
  getAllJobs,
  toggleJobVisibility,
  deleteJob
} from '../controllers/adminController.js';
import { checkAdminRole } from '../middlewares/adminAuth.middleware.js';

const adminRoutes = express.Router();

// Apply admin middleware to all routes
adminRoutes.use(checkAdminRole);

// User management routes
adminRoutes.get('/users', getAllUsers);                    // GET /api/admin/users
adminRoutes.get('/users/:userId', getUserById);            // GET /api/admin/users/:userId
adminRoutes.put('/users/:userId/ban', banUser);           // PUT /api/admin/users/:userId/ban
adminRoutes.put('/users/:userId/role', updateUserRole);   // PUT /api/admin/users/:userId/role

// Role management routes
adminRoutes.get('/roles', getAllRoles);                    // GET /api/admin/roles

// Job management routes
adminRoutes.get('/jobs', getAllJobs);                      // GET /api/admin/jobs
adminRoutes.put('/jobs/:jobId/toggle', toggleJobVisibility); // PUT /api/admin/jobs/:jobId/toggle
adminRoutes.delete('/jobs/:jobId', deleteJob);             // DELETE /api/admin/jobs/:jobId

export default adminRoutes;
