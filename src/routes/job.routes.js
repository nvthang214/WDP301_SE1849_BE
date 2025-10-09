import express from 'express';
import { 
    getAllJobs, 
    createJob,
    getJobById,
    updateJob,
    deleteJob
} from '../controllers/job.controllers.js';
const jobRoutes = express.Router();

// get all jobs
jobRoutes.get('/list', getAllJobs);
// create new job
jobRoutes.post('/create', createJob);
// get job by id
jobRoutes.get('/:id', getJobById);
// update job by id
jobRoutes.put('/:id', updateJob);
// delete job by id
jobRoutes.delete('/:id', deleteJob);

export default jobRoutes;
