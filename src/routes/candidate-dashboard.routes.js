import express from 'express';
import { getCandidateAppliedJobs } from '../controllers/candidate-dashboard.controller.js';

const candidateDashboardRoutes = express.Router();

candidateDashboardRoutes.get('/:candidateId/applied-jobs', getCandidateAppliedJobs);

export default candidateDashboardRoutes;
