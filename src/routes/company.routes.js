import express from 'express';
import { 
    getCompanyById
} from '../controllers/company.controller.js';
import { getCandidates } from '../controllers/candidate.controller.js'; // Import getCandidates
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';
import e from 'express';

const companyRoutes = express.Router();
// companyRoutes.use(authMiddleware);

companyRoutes.get('/:id', wrapAsync(getCompanyById));
// Get all jobs for a specific company
companyRoutes.get('/:companyId/jobs', wrapAsync(getCandidates));

export default companyRoutes;