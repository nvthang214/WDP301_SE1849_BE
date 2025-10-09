import { MESSAGE } from '../constants/message.js';
import Job from '../models/Job.js';
import { toResultOkWithMessage, toResultOkWithMessageAndData, toResultError } from '../results/Result.js';


// get all jobs with search & filters
export const getAllJobs = async (req, res) => {
  const { search, job_type, experience_level, isActive, location } = req.query;

  // query object
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (job_type) query.job_type = job_type;
  if (experience_level) query.experience_level = experience_level;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (location) query.location = { $regex: location, $options: 'i' };

  const jobs = await Job.find(query);
  if (jobs.length === 0) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND }));
  }
  res.json(toResultOkWithMessageAndData({ msg: MESSAGE.JOB_FETCH_SUCCESS, data: jobs }));
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