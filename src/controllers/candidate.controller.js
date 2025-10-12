// src/controllers/candidate.controller.js
import Application from '../models/Application.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOkWithMessageAndData, toResultError } from '../results/Result.js';

// @desc    Get candidates
// @route   GET /api/jobs/:jobId/candidates
// @route   GET /api/candidates
// @access  Private/Recruiter
export const getCandidates = async (req, res) => {
  const { jobId } = req.params;
  const { search, status } = req.query;

  // Check if user is a recruiter
  if (req.user.Role !== 'recruiter') {
    return res.json(toResultError({ statusCode: 403, msg: MESSAGE.NOT_AUTHORIZED }));
  }

  try {
    let query = {};

    if (jobId) {
      // Find applications for the specific job
      const applications = await Application.find({ job_id: jobId }).populate({
        path: 'candidate_id',
        populate: {
          path: 'user_id',
          select: 'FullName Email phone_number' // Select fields from User model
        }
      });

      let candidates = applications.map(app => {
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
      });

      // Further filtering based on query params can be added here
      if (status) {
        candidates = candidates.filter(c => c.status === status);
      }

      if (search) {
        candidates = candidates.filter(c =>
          c.candidate.user.FullName.toLowerCase().includes(search.toLowerCase())
        );
      }


      return res.json(
        toResultOkWithMessageAndData({
          msg: 'Candidates fetched successfully',
          data: candidates,
        })
      );
    } else {
      // Logic for fetching all candidates (not job-specific)
      const allCandidates = await Candidate.find().populate('user_id', 'FullName Email phone_number');
       return res.json(
        toResultOkWithMessageAndData({
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
