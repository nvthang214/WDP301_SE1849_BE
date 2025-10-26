import mongoose from "mongoose";
import Profile from "../models/Profile.js";
import { MESSAGE } from "../constants/message.js";
import { toResultError, toResultOk } from "../results/Result.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import Category from "../models/Category.js";
import Tag from "../models/Tag.js";



const SUPPORTED_SOCIAL_PLATFORMS = ["linkedin", "twitter", "facebook", "instagram"];

const PROFILE_SOCIAL_FIELDS = ["linkedin", "twitter", "facebook", "instagram"];

const normalizeToObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      return new mongoose.Types.ObjectId(trimmed);
    }

    const match = trimmed.match(/^ObjectId\(['"]?([0-9a-fA-F]{24})['"]?\)$/);
    if (match) {
      return new mongoose.Types.ObjectId(match[1]);
    }
  }

  return null;
};

const collectValidObjectIds = (values = []) => {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const objectId = normalizeToObjectId(value);
    if (objectId) {
      const key = objectId.toString();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(objectId);
      }
    }
  }

  return result;
};

const buildDocsMap = (docs = []) => {
  const map = new Map();
  for (const doc of docs) {
    if (doc?._id) {
      map.set(doc._id.toString(), doc);
    }
  }
  return map;
};

const hydrateApplications = async (applications = []) => {
  if (!applications.length) return [];

  const jobIds = collectValidObjectIds(applications.map((item) => item.job));
  if (!jobIds.length) return [];

  const jobs = await Job.find({ _id: { $in: jobIds } }).lean();

  const companyIds = collectValidObjectIds(jobs.map((job) => job.company));
  const categoryIds = collectValidObjectIds(jobs.map((job) => job.category));
  const tagIds = collectValidObjectIds(
    jobs.flatMap((job) => (Array.isArray(job.tags) ? job.tags : []))
  );

  const [companies, categories, tags] = await Promise.all([
    companyIds.length
      ? Company.find({ _id: { $in: companyIds } }).select("name logo").lean()
      : Promise.resolve([]),
    categoryIds.length
      ? Category.find({ _id: { $in: categoryIds } }).select("name").lean()
      : Promise.resolve([]),
    tagIds.length
      ? Tag.find({ _id: { $in: tagIds } }).select("name").lean()
      : Promise.resolve([]),
  ]);

  const jobMap = buildDocsMap(jobs);
  const companyMap = buildDocsMap(companies);
  const categoryMap = buildDocsMap(categories);
  const tagMap = buildDocsMap(tags);

  return applications
    .map((application) => {
      const jobId = normalizeToObjectId(application.job);
      if (!jobId) return null;

      const rawJob = jobMap.get(jobId.toString());
      if (!rawJob) return null;

      const companyId = normalizeToObjectId(rawJob.company);
      const categoryId = normalizeToObjectId(rawJob.category);
      const jobTagIds = Array.isArray(rawJob.tags)
        ? rawJob.tags
            .map((tagId) => normalizeToObjectId(tagId))
            .filter((tagId) => tagId)
        : [];

      const hydratedJob = {
        ...rawJob,
        company: companyId ? companyMap.get(companyId.toString()) || null : null,
        category: categoryId ? categoryMap.get(categoryId.toString()) || null : null,
        tags: jobTagIds
          .map((tagId) => tagMap.get(tagId.toString()))
          .filter((tagDoc) => Boolean(tagDoc)),
      };

      return {
        applicationId: application._id,
        status: application.status || null,
        resume: application.resume || "",
        coverLetter: application.coverLetter || "",
        appliedAt: application.createdAt,
        job: hydratedJob,
      };
    })
    .filter((item) => Boolean(item?.job));
};
//lọc data và trả về object chỉ chứa các trường hợp lệ
const sanitizeSocialPayload = (social) => {
  if (!social || typeof social !== "object") return null;

  const sanitized = {};
  for (const field of PROFILE_SOCIAL_FIELDS) {
    const value = social[field];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) sanitized[field] = trimmed;
    }
  }

  return Object.keys(sanitized).length ? sanitized : null;
};

const extractProfilePayload = (payload = {}) => {
  const baseFields = ["experience", "education", "bio", "cv", "location"];
  const result = {};

  for (const field of baseFields) {
    if (
      Object.prototype.hasOwnProperty.call(payload, field) &&
      payload[field] !== undefined
    ) {
      result[field] = payload[field];
    }
  }

  if (Array.isArray(payload.tags)) {
    result.tags = payload.tags;
  }

  const sanitizedSocial = sanitizeSocialPayload(payload.social);
  if (sanitizedSocial) {
    result.social = sanitizedSocial;
  }

  return result;
};

export const getCandidateProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }

    const profile = await Profile.findOne({ user: user._id })
      .populate("tags", "name")
      .lean();

    if (!profile)
      return res.json(toResultError({ statusCode: 404, msg: MESSAGE.PROFILE_NOT_FOUND }));

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_PROFILE_FETCH_SUCCESS,
        data: profile,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_PROFILE_FETCH_FAILED })
    );
  }
};

export const createCandidateProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }

    const existingProfile = await Profile.findOne({ user: user._id });
    if (existingProfile)
      return res.json(
        toResultError({
          statusCode: 409,
          msg: MESSAGE.CANDIDATE_PROFILE_ALREADY_EXISTS,
        })
      );

    const payload = extractProfilePayload(req.body);

    const profile = await Profile.create({
      ...payload,
      user: user._id,
    });

    const populatedProfile = await profile.populate("tags", "name");

    return res.status(201).json(
      toResultOk({
        statusCode: 201,
        msg: MESSAGE.CANDIDATE_PROFILE_CREATE_SUCCESS,
        data: populatedProfile,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_PROFILE_CREATE_FAILED })
    );
  }
};

export const updateCandidateProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }

    const profile = await Profile.findOne({ user: user._id });
    if (!profile)
      return res.json(toResultError({ statusCode: 404, msg: MESSAGE.PROFILE_NOT_FOUND }));

    const payload = extractProfilePayload(req.body);

    if (Object.keys(payload).length === 0)
      return res.json(toResultError({ statusCode: 400, msg: MESSAGE.FIELD_REQUIRED }));

    const { social, ...rest } = payload;

    for (const [key, value] of Object.entries(rest)) {
      profile[key] = value;
    }

    if (social) {
      const updatedSocial = { ...(profile.social || {}) };
      for (const [platform, url] of Object.entries(social)) {
        updatedSocial[platform] = url;
      }
      profile.social = updatedSocial;
    }

    await profile.save();
    await profile.populate("tags", "name");

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_PROFILE_UPDATE_SUCCESS,
        data: profile,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_PROFILE_UPDATE_FAILED })
    );
  }
};

export const getCandidateSocial = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }

    const profile = await Profile.findOne({ user: user._id }).select("social");
    if (!profile)
      return res.json(toResultError({ statusCode: 404, msg: MESSAGE.PROFILE_NOT_FOUND }));

    // Convert object => array để FE dễ hiển thị
    const socialArray = Object.entries(profile.social || {}).map(([platform, url]) => ({
      platform,
      url: url || "",
    }));

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SOCIAL_FETCH_SUCCESS,
        data: socialArray,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SOCIAL_FETCH_FAILED })
    );
  }
};

export const addCandidateSocial = async (req, res) => {
  try {
    const { social } = req.body;
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }

    if (!Array.isArray(social))
      return res.json(toResultError({ statusCode: 400, msg: MESSAGE.CANDIDATE_SOCIAL_ALREADY_EXISTS }));

    const profile = await Profile.findOne({ user: user._id });
    if (!profile)
      return res.json(toResultError({ statusCode: 404, msg: MESSAGE.PROFILE_NOT_FOUND }));

    // Map array → object
    const newSocial = {};
    for (const { platform, url } of social) {
      if (SUPPORTED_SOCIAL_PLATFORMS.includes(platform) && url) {
        newSocial[platform] = url;
      }
    }

    profile.social = newSocial;
    await profile.save();

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SOCIAL_CREATE_SUCCESS,
        data: profile.social,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SOCIAL_CREATE_FAILED })
    );
  }
};

export const updateCandidateSocial = async (req, res) => {
  try {
    const { platform, url } = req.body;

    if (!platform || !url)
      return res.json(toResultError({ statusCode: 400, msg: MESSAGE.FIELD_REQUIRED }));

    if (!SUPPORTED_SOCIAL_PLATFORMS.includes(platform))
      return res.json(
        toResultError({ statusCode: 400, msg: MESSAGE.CANDIDATE_PROFILE_UPDATE_FAILED})
      );

    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }

    const profile = await Profile.findOne({ user: user._id });
    if (!profile)
      return res.json(toResultError({ statusCode: 404, msg: MESSAGE.PROFILE_NOT_FOUND }));

    profile.social = { ...(profile.social || {}), [platform]: url };
    await profile.save();

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SOCIAL_UPDATE_SUCCESS,
        data: profile.social,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SOCIAL_UPDATE_FAILED })
    );
  }
};

export const deleteCandidateSocial = async (req, res) => {
  try {
    const { platform } = req.body;
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }

    if (!platform)
      return res.json(toResultError({ statusCode: 400, msg: MESSAGE.FIELD_REQUIRED }));

    const profile = await Profile.findOne({ user: user._id });
    if (!profile)
      return res.json(toResultError({ statusCode: 404, msg: MESSAGE.PROFILE_NOT_FOUND }));

    if (profile.social[platform]) {
      delete profile.social[platform];
      await profile.save();
    }

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SOCIAL_DELETE_SUCCESS,
        data: profile.social,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SOCIAL_DELETE_FAILED })
    );
  }
};

export const getCandidateAppliedJobs = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }

    const applications = await Application.find({ candidate: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const appliedJobs = await hydrateApplications(applications);

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_APPLIED_JOBS_FETCH_SUCCESS,
        data: appliedJobs,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({
        statusCode: 500,
        msg: MESSAGE.CANDIDATE_APPLIED_JOBS_FETCH_FAILED,
      })
    );
  }
};

export const applyJob = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }
    const roleName = user?.role?.name || user?.role;
    if (!roleName || String(roleName).toLowerCase() !== "candidate") {
      return res.json(
        toResultError({
          statusCode: 403,
          msg: MESSAGE.CANDIDATE_APPLY_JOB_ROLE_INVALID,
        })
      );
    }

    const { jobId, resume, coverLetter } = req.body;
    if (!jobId) {
      return res.json(
        toResultError({ statusCode: 400, msg: MESSAGE.FIELD_REQUIRED })
      );
    }

    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.JOB_NOT_FOUND })
      );
    }

    const existingApplication = await Application.findOne({
      candidate: user._id,
      job: jobId,
    });

    if (existingApplication) {
      return res.json(
        toResultError({ statusCode: 409, msg: MESSAGE.CANDIDATE_ALREADY_APPLIED_JOB })
      );
    }

    const application = await Application.create({
      candidate: user._id,
      job: jobId,
      resume: resume || "",
      coverLetter: coverLetter || "",
      status: "Pending",
    });

    const appliedJobs = await hydrateApplications([application.toObject()]);
    const appliedJob =
      appliedJobs[0] || {
        applicationId: application._id,
        status: application.status,
        resume: application.resume,
        coverLetter: application.coverLetter,
        appliedAt: application.createdAt,
        job,
      };

    return res.status(201).json(
      toResultOk({
        statusCode: 201,
        msg: MESSAGE.CANDIDATE_APPLY_JOB_SUCCESS,
        data: appliedJob,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({
        statusCode: 500,
        msg: MESSAGE.CANDIDATE_APPLY_JOB_FAILED,
      })
    );
  }
};

export const getInfoCandidate = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }
    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_PROFILE_FETCH_SUCCESS,
        data: user,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_PROFILE_FETCH_FAILED })
    );
  }
};

export const updateInfoCandidate = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    const user = req.user;
    if (!user) {
      return res.json(
        toResultError({ statusCode: 401, msg: MESSAGE.UNAUTHORIZED })
      );
    }
    if (typeof firstName === "string" && firstName.trim()) user.firstName = firstName.trim();
    if (typeof lastName === "string" && lastName.trim()) user.lastName = lastName.trim();

    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== "string") {
        return res.json(
          toResultError({ statusCode: 400, msg: MESSAGE.PHONENUMBER_INVALID })
        );
      }

      const sanitizedPhone = phoneNumber.trim();
      if (!sanitizedPhone) {
        return res.json(
          toResultError({ statusCode: 400, msg: MESSAGE.PHONENUMBER_INVALID })
        );
      }

      const phoneRegex = /^[0-9+()\-\s]{6,20}$/;
      if (!phoneRegex.test(sanitizedPhone)) {
        return res.json(
          toResultError({ statusCode: 400, msg: MESSAGE.PHONENUMBER_INVALID })
        );
      }

      user.phoneNumber = sanitizedPhone;
    }
    await user.save();
    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_PROFILE_UPDATE_SUCCESS,
        data: user,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_PROFILE_UPDATE_FAILED })
    );
  }
};
