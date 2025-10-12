import { MESSAGE } from '../constants/message.js';
import Job from '../models/Job.js';
import { toResultOkWithMessage, toResultOkWithMessageAndData, toResultError } from '../results/Result.js';


// get all jobs with search & filters & pagination
export const getAllJobs = async (req, res) => {
  const { search, jobType, experience, isActive, location, page = 1, limit = 15, minSalary, maxSalary } = req.query;

  // query object
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (jobType) query.jobType = jobType;
  if (experience) query.experience = experience;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (location) query.location = { $regex: location, $options: 'i' };

  // Filter theo min/max salary
  if (minSalary || maxSalary) {
    query.$and = [];
    if (minSalary) {
      query.$and.push({ minSalary: { $gte: Number(minSalary) } });
    }
    if (maxSalary) {
      query.$and.push({ maxSalary: { $lte: Number(maxSalary) } });
    }
    // Nếu đã có $and trong query (do các filter khác), gộp lại
    if (query.$and.length === 1) query = { ...query, ...query.$and[0] }, delete query.$and;
    if (query.$and && query.$and.length === 0) delete query.$and;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const jobs = await Job.find(query).skip(skip).limit(parseInt(limit));
  const total = await Job.countDocuments(query);

  if (jobs.length === 0) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
  }
  res.json(
    toResultOkWithMessageAndData({
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
    return res.json(toResultError({ statusCode: 500, msg: MESSAGE.JOB_CREATE_FAILED }));
  }
  res.json(toResultOkWithMessageAndData({ statusCode: 201, msg: MESSAGE.JOB_CREATE_SUCCESS, data: result }));
}

// get job by id
export const getJobById = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
  }
  res.json(toResultOkWithMessageAndData({ msg: MESSAGE.JOB_FETCH_SUCCESS, data: job }));
}

// update job by id
export const updateJob = async (req, res) => {
  const { id } = req.params;
  const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
  if (!updatedJob) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
  }
  res.json(toResultOkWithMessageAndData({ msg: MESSAGE.JOB_UPDATE_SUCCESS, data: updatedJob })); 
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
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
  }
  job.isActive = false;
  await job.save();
  res.json(toResultOkWithMessage({ msg: MESSAGE.JOB_DEACTIVATE_SUCCESS }));
}