import express from 'express';
import { 
    getAllJobs, 
    createJob,
    getJobById,
    updateJob,
    // deleteJob,
    deactivateJob
} from '../controllers/job.controllers.js';
<<<<<<< HEAD
=======
import { getCandidates } from '../controllers/candidate.controller.js'; // Import getCandidates
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
import { wrapAsync } from '../middlewares/error.middleware.js';
import { authMiddleware} from '../middlewares/auth.middleware.js';

const jobRoutes = express.Router();
<<<<<<< HEAD
jobRoutes.use(authMiddleware);
=======
// jobRoutes.use(authMiddleware);
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d

// get all jobs
jobRoutes.get('/', wrapAsync(getAllJobs));
// create new job
jobRoutes.post('/post', wrapAsync(createJob));
<<<<<<< HEAD
=======

// Get candidates for a specific job
jobRoutes.get('/:jobId/candidates', wrapAsync(getCandidates));

>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
// get job by id
jobRoutes.get('/:id', wrapAsync(getJobById));
// update job by id
jobRoutes.put('/edit/:id', wrapAsync(updateJob));
// delete job by id
// jobRoutes.delete('/:id', wrapAsync(deleteJob));
// deactivate job by id
jobRoutes.patch('/deactivate/:id', wrapAsync(deactivateJob));


export default jobRoutes;
