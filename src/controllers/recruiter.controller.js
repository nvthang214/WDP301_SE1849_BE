import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOk, toResultError } from '../results/Result.js';

// Get recruiter statistics (open jobs count, saved candidates count)
export const getRecruiterStats = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    
    // Count open jobs for this recruiter
    const openJobsCount = await Job.countDocuments({ 
      recruiter: recruiterId, 
      isActive: true 
    });
    
    // Count saved candidates (applications) for this recruiter's jobs
    const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);
    
    const savedCandidatesCount = await Application.countDocuments({
      job: { $in: jobIds }
    });
    
    const stats = {
      openJobs: openJobsCount,
      savedCandidates: savedCandidatesCount
    };
    
    return res.status(200).json(toResultOk({
      msg: "Recruiter statistics retrieved successfully",
      data: stats
    }));
  } catch (error) {
    console.error('Error getting recruiter stats:', error);
    return res.status(500).json(toResultError({ 
      statusCode: 500, 
      msg: MESSAGE.INTERNAL_SERVER_ERROR 
    }));
  }
};

// Get recently posted jobs for recruiter
export const getRecentlyPostedJobs = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { limit = 5 } = req.query;
    
    // Get recent jobs for this recruiter with application counts
    const jobs = await Job.find({ recruiter: recruiterId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('category', 'name')
      .populate('company', 'name')
      .lean();
    
    // Get application counts for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        
        // Calculate days remaining or expired status
        let duration;
        let status = 'Active';
        
        if (job.deadline) {
          const now = new Date();
          const deadline = new Date(job.deadline);
          const diffTime = deadline - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            duration = deadline.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
            status = 'Expired';
          } else {
            duration = `${diffDays} days remaining`;
          }
        } else {
          duration = 'No deadline set';
        }
        
        if (!job.isActive) {
          status = 'Inactive';
        }
        
        return {
          _id: job._id,
          title: job.title,
          jobType: job.jobType || 'Full Time',
          duration,
          status,
          applications: applicationCount,
          createdAt: job.createdAt,
          company: job.company?.name || 'Unknown Company'
        };
      })
    );
    
    return res.status(200).json(toResultOk({
      msg: "Recently posted jobs retrieved successfully",
      data: jobsWithStats
    }));
  } catch (error) {
    console.error('Error getting recently posted jobs:', error);
    return res.status(500).json(toResultError({ 
      statusCode: 500, 
      msg: MESSAGE.INTERNAL_SERVER_ERROR 
    }));
  }
};