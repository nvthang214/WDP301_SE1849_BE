import mongoose from 'mongoose';
import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import Tag from '../models/Tag.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import JobFavorite from '../models/JobFavorite.js';
import Category from '../models/Category.js';
import Company from '../models/Company.js';
import { toResultOk } from '../results/Result.js';


export const getAllJobs = async (req, res) => {
  const { search, categoryId, jobType, experience, isActive, page = 1, limit = 15, minSalary, maxSalary, remote } = req.query;

  let query = {};

  if (search) {
    const tags = await Tag.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    const tagIds = tags.map(tag => tag._id);

    const categories = await Category.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    const categoryIdsFromSearch = categories.map((c) => c._id);

    const companies = await Company.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    const companyIdsFromSearch = companies.map((c) => c._id);

    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { requirements: { $regex: search, $options: 'i' } },
      { desirable: { $regex: search, $options: 'i' } },
      { tags: { $in: tagIds } },
      { category: { $in: categoryIdsFromSearch } },
      { company: { $in: companyIdsFromSearch } },
      { country: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { jobLevel: { $regex: search, $options: 'i' } },
      { experience: { $regex: search, $options: 'i' } },
      { education: { $regex: search, $options: 'i' } },
    ];
  }
  // Validate categoryId before using it in query
  if (categoryId) {
    const categoryIdStr = String(categoryId).trim();
    if (categoryIdStr !== "" && mongoose.Types.ObjectId.isValid(categoryIdStr)) {
      query.category = categoryIdStr;
    } else if (categoryIdStr !== "") {
      // If categoryId is invalid, ignore it (don't filter by category)
      console.warn(`Invalid categoryId provided: ${categoryId}`);
    }
  }
  if (jobType) query.jobType = jobType;
  if (experience) query.experience = experience;
  if (isActive !== undefined) query.isActive = isActive === 'true';
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
    .populate({ path: 'tags', select: 'name -_id' });

  const total = await Job.countDocuments(query);

  res.json(
    toResultOk({
      msg: MESSAGE.JOB_FETCH_SUCCESS,
      data: {
        jobs,
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(404, MESSAGE.JOB_NOT_FOUND);
  }
  const job = await Job.findById(id)
    .populate({ path: 'recruiter', select: 'username firstName lastName -_id' })
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'company', select: 'name logo' })
    .populate({ path: 'tags', select: 'name' });
  if (!job) {
    throw new ErrorResponse(404, MESSAGE.JOB_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.JOB_FETCH_SUCCESS, data: job }));
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
};

// get number of applications of a job by job id
export const getNumberOfApplicationsByJobId = async (req, res) => {
  const { jobId } = req.params;
  const count = await Application.countDocuments({ job: jobId });
  res.json(toResultOk({ msg: MESSAGE.JOB_FETCH_SUCCESS, data: { count } }));
};