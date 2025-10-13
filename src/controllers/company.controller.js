import { MESSAGE } from '../constants/message.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import Company from '../models/Company.js';
import { toResultOk } from '../results/Result.js';

// get all companies with search & filters & pagination
export const getAllCompanies = async (req, res) => {
  const { search, industry, teamSize, page = 1, limit = 15 } = req.query;

  // query object
  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } }
    ];
  }
  if (industry) query.industry = { $regex: industry, $options: 'i' };
  if (teamSize) {
    const teamSizeNum = parseInt(teamSize);
    if (teamSizeNum <= 10) {
      query.teamSize = { $lte: 10 };
    } else if (teamSizeNum <= 50) {
      query.teamSize = { $gt: 10, $lte: 50 };
    } else if (teamSizeNum <= 200) {
      query.teamSize = { $gt: 50, $lte: 200 };
    } else {
      query.teamSize = { $gt: 200 };
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const companies = await Company.find(query)
    .populate('recruiter', 'firstName lastName email role')
    .skip(skip)
    .limit(parseInt(limit));
  const total = await Company.countDocuments(query);

  if (companies.length === 0) {
    throw new ErrorResponse(400, MESSAGE.COMPANY_FETCH_FAILED);
  }
  res.json(
    toResultOk({
      msg: MESSAGE.COMPANY_FETCH_SUCCESS,
      data: {
        companies,
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
  const userId = req.user?.id || null;
  
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
  
  // Populate recruiter data before sending response
  const populatedCompany = await Company.findById(result._id)
    .populate('recruiter', 'firstName lastName email role');
    
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

// get companies by recruiter id
export const getCompaniesByRecruiter = async (req, res) => {
  const { recruiterId } = req.params;
  const companies = await Company.find({ recruiter: recruiterId })
    .populate('recruiter', 'firstName lastName email role');
  
  if (companies.length === 0) {
    throw new ErrorResponse(404, MESSAGE.COMPANY_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.COMPANY_FETCH_SUCCESS, data: companies }));
}
