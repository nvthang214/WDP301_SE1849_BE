import express from 'express';
import { 
    getAllJobs, 
    createJob,
    getJobById,
    updateJob,
    // deleteJob,
    deactivateJob,
    getJobsByRecruiterId
} from '../controllers/job.controller.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';

const jobRoutes = express.Router();


// get all jobs
jobRoutes.get('/', wrapAsync(getAllJobs));
// get job by id
jobRoutes.get('/:id', wrapAsync(getJobById));

// use route middleware
jobRoutes.use(authMiddleware);

// create new job
jobRoutes.post('/post', wrapAsync(createJob));

// update job by id
jobRoutes.put('/edit/:id', wrapAsync(updateJob));

// deactivate job by id
jobRoutes.patch('/deactivate/:id', wrapAsync(deactivateJob));

// get jobs by recruiter id
jobRoutes.get('/recruiter/:recruiterId', wrapAsync(getJobsByRecruiterId));

export default jobRoutes;
