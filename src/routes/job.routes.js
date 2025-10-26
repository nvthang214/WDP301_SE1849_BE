import express from 'express';
import { 
    getAllJobs, 
    createJob,
    getJobById,
    updateJob,
    deactivateJob,
    getJobsByRecruiterId,
    toggleFavoriteAJob,
    getNumberOfApplicationsByJobId
} from '../controllers/job.controller.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';
import { recruiterMiddleware } from '../middlewares/recruiter.middleware.js';

const jobRoutes = express.Router();


// get all jobs
jobRoutes.get('/list', wrapAsync(getAllJobs));

// get job by id
jobRoutes.get('/details/:id', wrapAsync(getJobById));

///////////////////////////////////////////////////////////////////
// use auth middleware
jobRoutes.use(authMiddleware);

// get favorite jobs
jobRoutes.get('/list/isFavorite', wrapAsync(getAllJobs));

// get favorite job details when logged in
jobRoutes.get('/details/:id/isFavorite', wrapAsync(getJobById));

// favorite a job
jobRoutes.post('/favorite/:jobId', wrapAsync(toggleFavoriteAJob));

/////////////////////////////////////////////////////////////////
// use recruiter middleware
jobRoutes.use(recruiterMiddleware);
// get number of applications of a job by job id
jobRoutes.get('/applications/count/:jobId', wrapAsync(getNumberOfApplicationsByJobId));

// create new job
jobRoutes.post('/post', wrapAsync(createJob));

// update job by id
jobRoutes.put('/edit/:id', wrapAsync(updateJob));

// deactivate job by id
jobRoutes.patch('/deactivate/:id', wrapAsync(deactivateJob));

// get jobs by recruiter id
jobRoutes.get('/recruiter/my-jobs', wrapAsync(getJobsByRecruiterId));

export default jobRoutes;
