// src/controllers/application.controller.js
import Application from '../models/Application.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOk, toResultError } from '../results/Result.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json(toResultError({ statusCode: 401, msg: "Authentication required to apply for jobs" }));
    }
    
    const candidateId = req.user._id;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: candidateId
    });
    
    if (existingApplication) {
      return res.status(400).json(toResultError({ statusCode: 400, msg: MESSAGE.ALREADY_APPLIED }));
    }
    
    // Validate resume and cover letter
    const { resume, coverLetter } = req.body;
    
    if (!resume) {
      return res.status(400).json(toResultError({ statusCode: 400, msg: "Resume is required for job application" }));
    }
    
    // Create new application with timestamp
    const application = new Application({
      job: jobId,
      candidate: candidateId,
      resume: resume,
      coverLetter: coverLetter || "",
      status: 'pending',
      appliedDate: new Date()
    });
    
    await application.save();
    
    return res.status(201).json(toResultOk(application));
  } catch (error) {
    console.error('Error applying for job:', error);
    return res.status(500).json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
  }
};

// Get all candidates for a specific job
export const getCandidatesInJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if job exists and belongs to the recruiter's company
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
    }
    
    // Verify the recruiter has access to this job
    if (job.company.toString() !== req.user.company.toString()) {
      return res.status(403).json(toResultError({ statusCode: 403, msg: MESSAGE.UNAUTHORIZED }));
    }
    
    // Find all applications for this job with candidate details
    const applications = await Application.find({ job: jobId })
      .populate({
        path: 'candidate',
        select: 'fullName email phone avatar'
      });
    
    return res.status(200).json(toResultOk(applications));
  } catch (error) {
    console.error('Error getting candidates in job:', error);
    return res.status(500).json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
  }
};

// Filter candidates by status in a specific job
export const filterCandidatesByStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;
    
    if (!status) {
      return res.status(400).json(toResultError({ statusCode: 400, msg: MESSAGE.MISSING_FIELDS }));
    }
    
    // Check if job exists and belongs to the recruiter's company
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
    }
    
    // Verify the recruiter has access to this job
    if (job.company.toString() !== req.user.company.toString()) {
      return res.status(403).json(toResultError({ statusCode: 403, msg: MESSAGE.UNAUTHORIZED }));
    }
    
    // Find all applications for this job with the specified status
    const applications = await Application.find({ 
      job: jobId,
      status: status 
    }).populate({
      path: 'candidate',
      select: 'fullName email phone avatar'
    });
    
    return res.status(200).json(toResultOk(applications));
  } catch (error) {
    console.error('Error filtering candidates by status:', error);
    return res.status(500).json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
  }
};
