import express from 'express';
import { 
    getAllCompanies, 
    createCompany,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getCompaniesByRecruiter
} from '../controllers/company.controller.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';

const companyRoutes = express.Router();
companyRoutes.use(authMiddleware); 

// get all companies
companyRoutes.get('/', wrapAsync(getAllCompanies));
// create new company
companyRoutes.post('/create', wrapAsync(createCompany));
// get company by id
companyRoutes.get('/:id', wrapAsync(getCompanyById));
// update company by id
companyRoutes.put('/edit/:id', wrapAsync(updateCompany));
// delete company by id
companyRoutes.delete('/:id', wrapAsync(deleteCompany));
// get companies by recruiter id
companyRoutes.get('/recruiter/:recruiterId', wrapAsync(getCompaniesByRecruiter));

export default companyRoutes;
