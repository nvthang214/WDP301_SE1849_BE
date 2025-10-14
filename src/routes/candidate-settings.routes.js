import express from 'express';
import {
  getCandidatePersonalSettings,
  updateCandidatePersonalSettings,
  createCandidateResume,
  updateCandidateResume,
  deleteCandidateResume,
  getCandidateProfileSettings,
  updateCandidateProfileSettings,
  getCandidateSocialLinks,
  updateCandidateSocialLinks,
} from '../controllers/candidate-settings.controller.js';

const candidateSettingsRoutes = express.Router();

candidateSettingsRoutes.get('/:candidateId/personal', getCandidatePersonalSettings);
candidateSettingsRoutes.put('/:candidateId/personal', updateCandidatePersonalSettings);

candidateSettingsRoutes.post('/:candidateId/resumes', createCandidateResume);
candidateSettingsRoutes.patch('/:candidateId/resumes/:resumeId', updateCandidateResume);
candidateSettingsRoutes.delete('/:candidateId/resumes/:resumeId', deleteCandidateResume);

candidateSettingsRoutes.get('/:candidateId/profile', getCandidateProfileSettings);
candidateSettingsRoutes.put('/:candidateId/profile', updateCandidateProfileSettings);

candidateSettingsRoutes.get('/:candidateId/social-links', getCandidateSocialLinks);
candidateSettingsRoutes.put('/:candidateId/social-links', updateCandidateSocialLinks);

export default candidateSettingsRoutes;
