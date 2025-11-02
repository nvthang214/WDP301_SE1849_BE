// src/controllers/application.controller.js
import Application from "../models/Application.js";
import { MESSAGE } from "../constants/message.js";
import { toResultOk, toResultError } from "../results/Result.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Company from "../models/Company.js";

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user is authenticated
    if (!req.user) {
      return res
        .status(401)
        .json(toResultError({ statusCode: 401, msg: "Authentication required to apply for jobs" }));
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
      candidate: candidateId,
    });

    if (existingApplication) {
      return res.status(400).json(toResultError({ statusCode: 400, msg: MESSAGE.ALREADY_APPLIED }));
    }

    // Validate resume and cover letter
    const { resume, coverLetter } = req.body;

    if (!resume) {
      return res
        .status(400)
        .json(toResultError({ statusCode: 400, msg: "Resume is required for job application" }));
    }

    // Create new application with timestamp
    const application = new Application({
      job: jobId,
      candidate: candidateId,
      resume: resume,
      coverLetter: coverLetter || "",
      status: "pending",
      appliedDate: new Date(),
    });

    await application.save();

    return res.status(201).json(toResultOk({ data: application }));
  } catch (error) {
    console.error("Error applying for job:", error);
    return res
      .status(500)
      .json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
  }
};

// Get all candidates for a specific job
export const getCandidatesInJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId).populate('company');
    if (!job) {
      return res.status(404).json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
    }

    // Find the recruiter's company
    const recruiterCompany = await Company.findOne({ recruiter: req.user._id });
    if (!recruiterCompany) {
      return res.status(404).json(toResultError({ statusCode: 404, msg: "No company found for this recruiter" }));
    }

    // Verify the recruiter has access to this job
    if (job.company._id.toString() !== recruiterCompany._id.toString()) {
      return res.status(403).json(toResultError({ statusCode: 403, msg: MESSAGE.UNAUTHORIZED }));
    }

    // Find all applications for this job with candidate details
    const applications = await Application.find({ job: jobId })
      .populate({
        path: "candidate",
        select: "firstName lastName email phoneNumber avatar",
      })
      .populate({
        path: "job",
        select: "title company role location jobType",
        populate: {
          path: "company",
          select: "name logo"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(toResultOk({ data: applications }));
  } catch (error) {
    console.error("Error getting candidates in job:", error);
    return res
      .status(500)
      .json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
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
      status: status,
    }).populate({
      path: "candidate",
      select: "fullName email phone avatar",
    });

    return res.status(200).json(toResultOk({ data: applications }));
  } catch (error) {
    console.error("Error filtering candidates by status:", error);
    return res
      .status(500)
      .json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
  }
};

// Get all applications for recruiter's company jobs
export const getAllApplicationsByRecruiter = async (req, res) => {
  try {
    // Check if user is authenticated and is a recruiter
    if (!req.user) {
      return res
        .status(401)
        .json(toResultError({ statusCode: 401, msg: "Authentication required and must be a recruiter" }));
    }

    // Find company by recruiter ID
    const company = await Company.findOne({ recruiter: req.user._id });
    if (!company) {
      return res
        .status(404)
        .json(toResultError({ statusCode: 404, msg: "No company found for this recruiter" }));
    }

    const companyId = company._id;

    // Find all jobs belonging to the recruiter's company
    const companyJobs = await Job.find({ company: companyId }).select('_id');
    const jobIds = companyJobs.map(job => job._id);

    // Find all applications for these jobs
    const applications = await Application.find({ 
      job: { $in: jobIds } 
    })
    .populate({
      path: "candidate",
      select: "firstName lastName email phoneNumber avatar",
    })
    .populate({
      path: "job",
      select: "title company role location jobType",
      populate: {
        path: "company",
        select: "name logo"
      }
    })
    .sort({ createdAt: -1 }); // Sort by newest first

    return res.status(200).json(toResultOk(applications));
  } catch (error) {
    console.error("Error getting all applications by recruiter:", error);
    return res
      .status(500)
      .json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
  }
};

// Get shortlisted applications for recruiter's company jobs
export const getShortlistedApplicationsByRecruiter = async (req, res) => {
  try {
    // Check if user is authenticated and is a recruiter
    if (!req.user) {
      return res
        .status(401)
        .json(toResultError({ statusCode: 401, msg: "Authentication required and must be a recruiter" }));
    }

    // Find company by recruiter ID
    const company = await Company.findOne({ recruiter: req.user._id });
    if (!company) {
      return res
        .status(404)
        .json(toResultError({ statusCode: 404, msg: "No company found for this recruiter" }));
    }

    const companyId = company._id;

    // Find all jobs belonging to the recruiter's company
    const companyJobs = await Job.find({ company: companyId }).select('_id');
    const jobIds = companyJobs.map(job => job._id);

    // Find all shortlisted applications for these jobs
    const shortlistedApplications = await Application.find({ 
      job: { $in: jobIds },
      status: "shortlisted" // Assuming "shortlisted" is the status for shortlisted applications
    })
    .populate({
      path: "candidate",
      select: "firstName lastName email phoneNumber avatar",
    })
    .populate({
      path: "job",
      select: "title company role location jobType",
      populate: {
        path: "company",
        select: "name logo"
      }
    })
    .sort({ createdAt: -1 }); // Sort by newest first

    return res.status(200).json(toResultOk({ data: shortlistedApplications }));
  } catch (error) {
    console.error("Error getting shortlisted applications by recruiter:", error);
    return res
      .status(500)
      .json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json(toResultError({ statusCode: 400, msg: MESSAGE.MISSING_FIELDS }));
    }

    const allowedStatuses = ["pending", "shortlisted", "interview", "rejected", "hired"];
    const normalizedStatus = String(status).trim().toLowerCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res
        .status(400)
        .json(
          toResultError({
            statusCode: 400,
            msg: "Invalid status. Allowed: pending, shortlisted, interview, rejected, hired",
          })
        );
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res
        .status(404)
        .json(toResultError({ statusCode: 404, msg: "Application not found" }));
    }

    // Verify recruiter has access to this job (belongs to their company)
    const job = await Job.findById(application.job).populate("company");
    if (!job) {
      return res.status(404).json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
    }

    const recruiterCompany = await Company.findOne({ recruiter: req.user._id });
    if (!recruiterCompany) {
      return res
        .status(404)
        .json(toResultError({ statusCode: 404, msg: "No company found for this recruiter" }));
    }

    if (job.company._id.toString() !== recruiterCompany._id.toString()) {
      return res.status(403).json(toResultError({ statusCode: 403, msg: MESSAGE.UNAUTHORIZED }));
    }

    // Transition rules: forward-only, with terminal statuses
    const currentStatus = String(application.status || "pending").toLowerCase();
    const allowedNext = {
      pending: ["shortlisted", "interview", "rejected"],
      shortlisted: ["interview", "rejected"],
      interview: ["hired", "rejected"],
      hired: [],
      rejected: [],
    };

    // No change
    if (normalizedStatus === currentStatus) {
      return res
        .status(400)
        .json(
          toResultError({ statusCode: 400, msg: "Status is unchanged" })
        );
    }

    // Terminal check
    if (["hired", "rejected"].includes(currentStatus)) {
      return res
        .status(400)
        .json(
          toResultError({ statusCode: 400, msg: `Cannot update status from terminal state: ${currentStatus}` })
        );
    }

    // Validate forward transition
    const nextAllowed = allowedNext[currentStatus] || [];
    if (!nextAllowed.includes(normalizedStatus)) {
      return res
        .status(400)
        .json(
          toResultError({ statusCode: 400, msg: `Invalid transition from '${currentStatus}' to '${normalizedStatus}'` })
        );
    }

    application.status = normalizedStatus;
    await application.save();

    const populatedApplication = await Application.findById(applicationId)
      .populate({
        path: "candidate",
        select: "firstName lastName email phoneNumber avatar",
      })
      .populate({
        path: "job",
        select: "title company role location jobType",
        populate: {
          path: "company",
          select: "name logo",
        },
      });

    return res.status(200).json(
      toResultOk({
        data: populatedApplication,
      })
    );
  } catch (error) {
    console.error("Error updating application status:", error);
    return res
      .status(500)
      .json(toResultError({ statusCode: 500, msg: MESSAGE.INTERNAL_SERVER_ERROR }));
  }
};
