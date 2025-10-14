import mongoose from 'mongoose';
import Application from '../models/Application.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOk, toResultError } from '../results/Result.js';

const formatAppliedJob = (application) => {
  const jobDoc = application.job;
  const job = jobDoc && typeof jobDoc.toObject === 'function' ? jobDoc.toObject() : jobDoc;
  const companyDoc = job?.company;
  const company = companyDoc && typeof companyDoc.toObject === 'function' ? companyDoc.toObject() : companyDoc;
  const locationFromParts = [job?.location, job?.city, job?.country]
    .filter(Boolean)
    .join(', ');

  const salaryAvailable = job?.minSalary !== undefined && job?.minSalary !== null
    || job?.maxSalary !== undefined && job?.maxSalary !== null;

  return {
    applicationId: application._id,
    jobId: job?._id ?? null,
    title: job?.title ?? null,
    company: company
      ? {
          id: company._id,
          name: company.name,
          logo: company.logo ?? null,
        }
      : null,
    employmentType: job?.jobType ?? null,
    remote: Boolean(job?.remote),
    location: locationFromParts || null,
    salary: salaryAvailable
      ? {
          min: job?.minSalary ?? null,
          max: job?.maxSalary ?? null,
          type: job?.salaryType ?? null,
        }
      : null,
    status: application.status ?? null,
    resume: application.resume ?? null,
    appliedAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
};

export const getCandidateAppliedJobs = async (req, res) => {
  const { candidateId } = req.params;
  const { status, page = 1, limit = 10, sort = 'desc' } = req.query;

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  try {
    const candidateObjectId = new mongoose.Types.ObjectId(candidateId);
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const sortDirection = sort === 'asc' ? 1 : -1;

    const filter = { candidate: candidateObjectId };
    if (status) {
      filter.status = status;
    }

    const [applications, total, statusGrouping] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'job',
          select:
            'title jobType remote minSalary maxSalary salaryType location city country company',
          populate: { path: 'company', select: 'name logo' },
        })
        .sort({ createdAt: sortDirection })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Application.countDocuments(filter),
      Application.aggregate([
        { $match: { candidate: candidateObjectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const summaryByStatus = statusGrouping.reduce((acc, item) => {
      const key = item._id || 'unknown';
      acc[key] = item.count;
      return acc;
    }, {});

    const items = applications.map((application) => formatAppliedJob(application));

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_APPLIED_JOBS_FETCH_SUCCESS,
        data: {
          items,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber) || 0,
          },
          summary: {
            total,
            byStatus: summaryByStatus,
          },
        },
      })
    );
  } catch (error) {
    console.error('[getCandidateAppliedJobs] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_APPLIED_JOBS_FETCH_FAILED })
    );
  }
};
