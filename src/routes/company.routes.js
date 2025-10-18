import express from 'express';
import {
    createCompany,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getCompaniesByRecruiter
} from '../controllers/company.controller.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const companyRoutes = express.Router();
// companyRoutes.use(authMiddleware);

// Routes cụ thể phải đặt TRƯỚC routes có parameter
// get companies by recruiter ID
companyRoutes.get('/recruiter/:recruiterId', wrapAsync(getCompaniesByRecruiter));

// Routes có parameter phải đặt SAU routes cụ thể
companyRoutes.get('/:id', wrapAsync(getCompanyById));
// update company by id
companyRoutes.put('/edit/:id', wrapAsync(updateCompany));
// create new company
companyRoutes.post('/create', wrapAsync(createCompany));
// delete company by id
companyRoutes.delete('/:id', wrapAsync(deleteCompany));

export default companyRoutes;