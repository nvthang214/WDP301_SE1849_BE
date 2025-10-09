import express from 'express';
import { 
    getAllJobs, 
    createJob,
    getJobById,
    updateJob,
    // deleteJob,
    deactivateJob
} from '../controllers/job.controllers.js';
import wrapAsync from '../utils/handler.js';
const jobRoutes = express.Router();

// get all jobs
jobRoutes.get('/list', wrapAsync(getAllJobs));
// create new job
jobRoutes.post('/create', wrapAsync(createJob));
// get job by id
jobRoutes.get('/:id', wrapAsync(getJobById));
// update job by id
jobRoutes.put('/:id', wrapAsync(updateJob));
// delete job by id
// jobRoutes.delete('/:id', wrapAsync(deleteJob));
// deactivate job by id
jobRoutes.patch('/deactivate/:id', wrapAsync(deactivateJob));


export default jobRoutes;
