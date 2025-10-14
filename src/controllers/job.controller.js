import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import Tag from '../models/Tag.js';
import Job from '../models/Job.js';
import { toResultOk } from '../results/Result.js';


export const getAllJobs = async (req, res) => {
  const { search, categoryId, jobType, experience, isActive, location, page = 1, limit = 15, minSalary, maxSalary, remote } = req.query;

  let query = {};

  if (search) {
    const tags = await Tag.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    const tagIds = tags.map(tag => tag._id);

    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: tagIds } }
    ];
  }
  if (categoryId) query.category = categoryId;
  if (jobType) query.jobType = jobType;
  if (experience) query.experience = experience;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (location) query.location = { $regex: location, $options: 'i' };
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
    .populate({ path: 'company', select: 'name -_id' })
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
  const newJob = new Job(req.body);
  const result = await newJob.save();
  if (!result) {
    throw new ErrorResponse(400, MESSAGE.JOB_CREATE_FAILED);
  }
  res.json(toResultOk({ statusCode: 201, msg: MESSAGE.JOB_CREATE_SUCCESS, data: result }));
}

// get job by id
export const getJobById = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id)
    .populate({ path: 'recruiter', select: 'username firstName lastName -_id' })
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'company', select: 'name' })
    .populate({ path: 'tags', select: 'name' });
  if (!job) {
    throw new ErrorResponse(404, MESSAGE.JOB_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.JOB_FETCH_SUCCESS, data: job }));
}

// update job by id
export const updateJob = async (req, res) => {
  const { id } = req.params;
  const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
  if (!updatedJob) {
    throw new ErrorResponse(404, MESSAGE.JOB_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.JOB_UPDATE_SUCCESS, data: updatedJob }));
}

// delete job by id
// export const deleteJob = async (req, res) => {  
//   const { id } = req.params;
//   const deletedJob = await Job.findByIdAndDelete(id);
//   if (!deletedJob) {
//     return res.json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
//   }
//   res.json(toResultOkWithMessage({ msg: MESSAGE.JOB_DELETE_SUCCESS }));
// }

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