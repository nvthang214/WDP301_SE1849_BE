import mongoose from 'mongoose';
import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import Tag from '../models/Tag.js';
import Job from '../models/Job.js';
import JobFavorite from '../models/JobFavorite.js';
import { toResultOk } from '../results/Result.js';


export const getAllJobs = async (req, res) => {
  const { search, categoryId, jobType, experience, isActive = true, page = 1, limit = 15, minSalary, maxSalary, remote } = req.query;
  const userId = req.user?._id || null;

  let query = {};

  if (search) {
    const tags = await Tag.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    const tagIds = tags.map(tag => tag._id);

    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { tags: { $in: tagIds } },
      { company: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { isActive: isActive }
    ];
  }
  if (categoryId) query.category = categoryId;
  if (jobType) query.jobType = jobType;
  if (experience) query.experience = experience; 
  if (remote !== undefined) query.remote = remote === 'true';

  if (minSalary || maxSalary) {
    query.$and = query.$and || [];
    if (minSalary) {
      query.$and.push({ minSalary: { $gte: Number(minSalary) } });
    }
    if (maxSalary) {
      query.$and.push({ maxSalary: { $lte: Number(maxSalary) } });
    }
    if (query.$and.length === 1) {
      query = { ...query, ...query.$and[0] };
      delete query.$and;
    }
    if (query.$and && query.$and.length === 0) delete query.$and;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const jobs = await Job.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .populate({ path: 'recruiter', select: 'firstName lastName -_id' })
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'company', select: 'name logo' })
    .populate({ path: 'tags', select: 'name -_id' })
    .lean();

  // Add isFavorite flag for each job based on JobFavorite by userId
  let favoriteSet = new Set();
  if (userId && jobs.length) {
    const jobIds = jobs.map(j => j._id);
    const favorites = await JobFavorite.find({ candidate: userId, job: { $in: jobIds } })
      .select('job')
      .lean();
    favoriteSet = new Set(favorites.map(f => String(f.job)));
  }

  const jobsWithFavorite = jobs.map(j => ({
    ...j,
    isFavorite: favoriteSet.has(String(j._id))
  }));

  const total = await Job.countDocuments(query);

  res.json(
    toResultOk({
      msg: MESSAGE.JOB_FETCH_SUCCESS,
      data: {
        jobs: jobsWithFavorite,
        totalPages: Math.ceil(total / limit)
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    })
  );
}

// toggle favorite a job
export const toggleFavoriteAJob = async (req, res) => {
  const candidateId = req?.user._id;
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ErrorResponse(404, MESSAGE.JOB_NOT_FOUND);
  }
  const existingFavorite = await JobFavorite.findOne({ candidate: candidateId, job: jobId });
  if (existingFavorite) {
    // If already favorited, remove it
    await JobFavorite.deleteOne({ _id: existingFavorite._id });
    res.json(toResultOk({ msg: MESSAGE.JOB_FAVORITE_REMOVED }));
  } else {
    // If not favorited, create a new favorite
    const newFavorite = new JobFavorite({ candidate: candidateId, job: jobId });
    await newFavorite.save();
    res.json(toResultOk({ msg: MESSAGE.JOB_FAVORITE_ADDED }));
  }
}

// create new job
export const createJob = async (req, res) => {
  const recruiterId = req?.user._id;
  const newJob = new Job({ ...req.body, recruiter: recruiterId });
  const result = await newJob.save();
  if (!result) {
    throw new ErrorResponse(400, MESSAGE.JOB_CREATE_FAILED);
  }
  res.json(toResultOk({ statusCode: 201, msg: MESSAGE.JOB_CREATE_SUCCESS, data: result }));
}

// get job by id
export const getJobById = async (req, res) => {
  const { id } = req.params;

  const userId = req.user?._id || null;

  const job = await Job.findById(id)
    .populate({ path: 'recruiter', select: 'username firstName lastName -_id' })
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'company', select: 'name logo' })
    .populate({ path: 'company', select: 'name logo' })
    .populate({ path: 'tags', select: 'name' });
  if (!job) {
    throw new ErrorResponse(404, MESSAGE.JOB_NOT_FOUND);
  }
  // Determine favorite flag for this job
  let isFavorite = false;
  if (userId) {
    const fav = await JobFavorite.exists({ candidate: userId, job: id });
    isFavorite = !!fav;
  }

  const jobObj = job.toObject();
  jobObj.isFavorite = isFavorite;

  res.json(toResultOk({ msg: MESSAGE.JOB_FETCH_SUCCESS, data: jobObj }));
}

// update job by id
export const updateJob = async (req, res) => {
  const recruiterId = req?.user._id;
  const { id } = req.params;
  const updatedJob = await Job.findByIdAndUpdate(id, { ...req.body, recruiter: recruiterId }, { new: true });
  if (!updatedJob) {
    throw new ErrorResponse(404, MESSAGE.JOB_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.JOB_UPDATE_SUCCESS, data: updatedJob }));
}


// deactivate job by id
export const deactivateJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    throw new ErrorResponse(404, MESSAGE.JOB_NOT_FOUND);
  }
  job.isActive = false;
  await job.save();
  res.json(toResultOk({ msg: MESSAGE.JOB_DEACTIVATE_SUCCESS }));
}

// get jobs by recruiter id
export const getJobsByRecruiterId = async (req, res) => {
  const recruiterId = req.user._id;
  const jobs = await Job.find({ recruiter: recruiterId });
  res.json(toResultOk({ msg: MESSAGE.JOB_FETCH_SUCCESS, data: jobs }));
}