// src/controllers/application.controller.js
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOkWithMessageAndData, toResultError } from '../results/Result.js';

// @desc    Update application status
// @route   PATCH /api/applications/:id
// @access  Private/Recruiter
export const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const recruiterId = req.user._id;

  // Check if user is a recruiter
  if (req.user.Role !== 'recruiter') {
    return res.json(toResultError({ statusCode: 403, msg: MESSAGE.NOT_AUTHORIZED }));
  }

  try {
    const application = await Application.findById(id);

    if (!application) {
      return res.json(toResultError({ statusCode: 404, msg: 'Application not found' }));
    }

    // Optional: Check if the recruiter is the one who posted the job
    const job = await Job.findById(application.job_id);
    if (job && job.recruiter_id.toString() !== recruiterId.toString()) {
        return res.json(toResultError({ statusCode: 403, msg: 'You are not authorized to update this application.' }));
    }

    application.status = status;
    await application.save();

    res.json(
      toResultOkWithMessageAndData({
        msg: 'Application status updated successfully',
        data: application,
      })
    );
  } catch (error) {
    console.error(error);
    res.json(toResultError({ statusCode: 500, msg: 'Server Error' }));
  }
};
