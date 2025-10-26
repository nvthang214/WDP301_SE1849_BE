import { MESSAGE } from "../constants/message.js";
import ErrorResponse from "../lib/helper/ErrorResponse.js";
import { toResultOk } from "../results/Result.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";

//get all companies with search & filters & pagination
export const getAllCompanies = async (req, res) => {
  const { search, industry, location, page = 1, limit = 15 } = req.query;
  // query object
  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }
  if (industry) query.industry = { $regex: industry, $options: "i" };
  if (location) query.address = { $regex: location, $options: "i" };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const companies = await Company.find(query).skip(skip).limit(parseInt(limit));
  const total = await Company.countDocuments(query);
  if (companies.length === 0) {
    throw new ErrorResponse(400, MESSAGE.COMPANY_FETCH_FAILED);
  }
  res.json(
    toResultOk({
      msg: MESSAGE.COMPANY_FETCH_SUCCESS,
      data: {
        companies,
        totalPages: Math.ceil(total / limit),
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    })
  );
};

// Get all companies by location with pagination
export const getAllCompaniesByLocation = async (req, res) => {
  const { location, page = 1, limit = 15 } = req.query;
  
  // Validate location parameter
  if (!location || location.trim() === '') {
    throw new ErrorResponse(400, "Location parameter is required");
  }
  
  // Build query object for location search
  let query = {
    address: { $regex: location.trim(), $options: "i" }
  };
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const companies = await Company.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .select('name address industry logo description contact website');
    
  const total = await Company.countDocuments(query);
  
  // Trả về kết quả (có thể là mảng rỗng)
  res.json(
    toResultOk({
      msg: companies.length > 0 ? MESSAGE.COMPANY_FETCH_SUCCESS : "No companies found in this location",
      data: {
        companies,
        location: location.trim(),
        totalPages: Math.ceil(total / limit),
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    })
  );
};

// Get open all job for a company with search & filters & pagination
export const getAllJobsForCompany = async (req, res) => {
  const { companyId } = req.params;
  const { search, isActive, location, page = 1, limit = 15 } = req.query;
  // query object
  let query = { company: companyId };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (location) query.location = { $regex: location, $options: "i" };
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
        totalPages: Math.ceil(total / limit),
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    })
  );
};

// create new company
export const createCompany = async (req, res) => {
  // Get user ID from auth middleware (nếu có) hoặc để null nếu không có auth
  const userId = req.user?._id || "68ebccd50612c5184b23abbe";

  // Add recruiter field với user ID (có thể null)
  const companyData = {
    ...req.body,
    recruiter: userId,
  };

  const newCompany = new Company(companyData);
  const result = await newCompany.save();
  if (!result) {
    throw new ErrorResponse(400, MESSAGE.COMPANY_CREATE_FAILED);
  }

  // Populate recruiter data before sending response (only if recruiter exists)
  let populatedCompany;
  if (userId) {
    populatedCompany = await Company.findById(result._id).populate(
      "recruiter",
      "firstName lastName email role"
    );
  } else {
    populatedCompany = await Company.findById(result._id);
  }

  res.json(
    toResultOk({ statusCode: 201, msg: MESSAGE.COMPANY_CREATE_SUCCESS, data: populatedCompany })
  );
};

// get company by id
export const getCompanyById = async (req, res) => {
  const { id } = req.params;
  const company = await Company.findById(id).populate("recruiter", "firstName lastName email role");
  if (!company) {
    res.json(toResultOk({ msg: MESSAGE.COMPANY_NOT_FOUND, data: null }));
    return;
  }
  res.json(toResultOk({ msg: MESSAGE.COMPANY_FETCH_SUCCESS, data: company }));
};

// update company by id
export const updateCompany = async (req, res) => {
  const { id } = req.params;

  // Validate phone number (must be 10 digits)
  if (req.body.contact && req.body.contact.phone) {
    const phoneToValidate = req.body.contact.phone;
    const cleanPhone = phoneToValidate.replace(/\s+/g, "").replace(/[^\d]/g, "");
    if (cleanPhone.length !== 10 || !/^[0-9]+$/.test(cleanPhone)) {
      throw new ErrorResponse(400, MESSAGE.COMPANY_PHONE_INVALID);
    }
    // Save clean phone
    req.body.contact.phone = cleanPhone;
  }

  const updatedCompany = await Company.findByIdAndUpdate(id, req.body, { new: true }).populate(
    "recruiter",
    "firstName lastName email role"
  );
  if (!updatedCompany) {
    throw new ErrorResponse(404, MESSAGE.COMPANY_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.COMPANY_UPDATE_SUCCESS, data: updatedCompany }));
};

// delete company by id
export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  const deletedCompany = await Company.findByIdAndDelete(id);
  if (!deletedCompany) {
    throw new ErrorResponse(404, MESSAGE.COMPANY_NOT_FOUND);
  }
  res.json(toResultOk({ msg: MESSAGE.COMPANY_DELETE_SUCCESS }));
};

export const getCompanyOfRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const company = await Company.findOne({ recruiter: recruiterId });
    res.json(toResultOk({ msg: MESSAGE.COMPANY_FETCH_SUCCESS, data: company }));
  } catch (error) {
    throw new ErrorResponse(500, "Error fetching company by recruiter");
  }
};

export const getCompanyByRecruiterId = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const company = await Company.findOne({ recruiter: recruiterId });
    res.json(toResultOk({ msg: MESSAGE.COMPANY_FETCH_SUCCESS, data: company }));
  } catch (error) {
    throw new ErrorResponse(500, "Error fetching company by recruiter ID");
  }
};
