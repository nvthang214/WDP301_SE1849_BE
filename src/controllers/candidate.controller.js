// src/controllers/candidate.controller.js
import Application from '../models/Application.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOk, toResultError } from '../results/Result.js';

// @desc    Get candidates
// @route   GET /api/jobs/:jobId/candidates
// @route   GET /api/candidates
// @access  Private/Recruiter
export const getCandidates = async (req, res) => {
  const { jobId } = req.params;
  const { search, status } = req.query;

  try {
    // Check if user is a recruiter
    const recruiter = await User.findById(req.user._id).populate('role');
    if (!recruiter || recruiter.role.name !== 'recruiter') {
      return res.json(toResultError({ statusCode: 403, msg: MESSAGE.NOT_AUTHORIZED }));
    }

    if (jobId) {
      // Find applications for the specific job
      const applications = await Application.find({ job_id: jobId }).populate({
        path: 'candidate_id',
        populate: {
          path: 'user_id',
          select: 'firstName lastName email phoneNumber' // Select fields from User model
        }
      });

      let candidates = applications.map(app => {
        if (!app.candidate_id || !app.candidate_id.user_id) return null;
        const candidateData = app.candidate_id;
        const userData = candidateData.user_id;
        return {
          applicationId: app._id,
          status: app.status,
          candidate: {
            ...candidateData.toObject(),
            user: userData.toObject()
          }
        };
      }).filter(Boolean); // Remove null entries

      // Further filtering based on query params
      if (status) {
        candidates = candidates.filter(c => c.status === status);
      }

      if (search) {
        const searchTerm = search.toLowerCase();
        candidates = candidates.filter(c => {
          const user = c.candidate.user;
          return user.firstName.toLowerCase().includes(searchTerm) || 
                 user.lastName.toLowerCase().includes(searchTerm);
        });
      }

      return res.json(
        toResultOk({
          msg: 'Candidates for job fetched successfully',
          data: candidates,
        })
      );
    } else {
      // Logic for fetching all candidates (not job-specific)
      const allCandidates = await Candidate.find().populate('user_id', 'firstName lastName email phoneNumber');
       return res.json(
        toResultOk({
          msg: 'All candidates fetched successfully',
          data: allCandidates,
        })
      );
    }

  } catch (error) {
    console.error(error);
    res.json(toResultError({ statusCode: 500, msg: 'Server Error' }));
  }
};
