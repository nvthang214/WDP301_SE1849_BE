import express from 'express';
import { 
    getAllJobs, 
    createJob,
    getJobById,
    updateJob,
    // deleteJob,
    deactivateJob
} from '../controllers/job.controllers.js';
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';

const jobRoutes = express.Router();
jobRoutes.use(authMiddleware);

// get all jobs
jobRoutes.get('/', wrapAsync(getAllJobs));
// create new job
jobRoutes.post('/post', wrapAsync(createJob));
// get job by id
jobRoutes.get('/:id', wrapAsync(getJobById));
// update job by id
jobRoutes.put('/edit/:id', wrapAsync(updateJob));
// delete job by id
// jobRoutes.delete('/:id', wrapAsync(deleteJob));
// deactivate job by id
jobRoutes.patch('/deactivate/:id', wrapAsync(deactivateJob));


export default jobRoutes;
