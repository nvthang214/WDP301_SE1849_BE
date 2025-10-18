import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { toResultOk } from '../results/Result.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';





// Get open all job for a company with search & filters & pagination
export const getAllJobsForCompany = async (req, res) => {
  const { companyId } = req.params;
  const { search, isActive, location, page = 1, limit = 15 } = req.query;
  // query object
  let query = { company: companyId };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (location) query.location = { $regex: location, $options: 'i' };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const jobs = await Job.find(query).skip(skip).limit(parseInt(limit));
  const total = await Job.countDocuments(query);
  if (jobs.length === 0) {
    throw new ErrorResponse(400, MESSAGE.JOB_FETCH_FAILED);
  }
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

// create new company
export const createCompany = async (req, res) => {
  // Get user ID from auth middleware (nếu có) hoặc để null nếu không có auth
  const userId = req.user?.userId || "68ebccd50612c5184b23abbe";

  // Add recruiter field với user ID (có thể null)
  const companyData = {
    ...req.body,
    recruiter: userId
  };

  const newCompany = new Company(companyData);
  const result = await newCompany.save();
  if (!result) {
    throw new ErrorResponse(400, MESSAGE.COMPANY_CREATE_FAILED);
  }

  // Populate recruiter data before sending response (only if recruiter exists)
  let populatedCompany;
  if (userId) {
    populatedCompany = await Company.findById(result._id)
      .populate('recruiter', 'firstName lastName email role');
  } else {
    populatedCompany = await Company.findById(result._id);
  }

  res.json(toResultOk({ statusCode: 201, msg: MESSAGE.COMPANY_CREATE_SUCCESS, data: populatedCompany }));
}

// get company by id
export const getCompanyById = async (req, res) => {
  const { id } = req.params;
  const company = await Company.findById(id).populate('recruiter', 'firstName lastName email role');
  if (!company) {
    throw new ErrorResponse(404, MESSAGE.COMPANY_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.COMPANY_FETCH_SUCCESS, data: company }));
}

// update company by id
export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const updatedCompany = await Company.findByIdAndUpdate(id, req.body, { new: true })
.populate('recruiter', 'firstName lastName email role');
  if (!updatedCompany) {
    throw new ErrorResponse(404, MESSAGE.COMPANY_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.COMPANY_UPDATE_SUCCESS, data: updatedCompany }));
}

// delete company by id
export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  const deletedCompany = await Company.findByIdAndDelete(id);
  if (!deletedCompany) {
    throw new ErrorResponse(404, MESSAGE.COMPANY_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.COMPANY_DELETE_SUCCESS }));
}

// get companies by recruiter ID
export const getCompaniesByRecruiter = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const companies = await Company.findOne({ recruiter: recruiterId });
    res.json(toResultOk({ msg: MESSAGE.COMPANY_FETCH_SUCCESS, data: companies }));
  } catch (error) {
    throw new ErrorResponse(500, 'Error fetching companies by recruiter');
  }
}