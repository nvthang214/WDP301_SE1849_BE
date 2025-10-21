import Profile from "../models/Profile.js";
import { MESSAGE } from "../constants/message.js";
import { toResultError, toResultOk } from "../results/Result.js";
import User from "../models/User.js";
import Application from "../models/Application.js";

const SUPPORTED_SOCIAL_PLATFORMS = [
  "linkedin",
  "twitter",
  "facebook",
  "instagram",
  "youtube",
];

const PROFILE_SOCIAL_FIELDS = ["linkedin", "twitter", "facebook", "instagram"];

const ensureCandidateUser = async (res, userId) => {
  const user = await User.findById(userId).populate("role", "name");

  if (!user) {
    res.json(toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }));
    return null;
  }

  if (user.role?.name !== "candidate") {
    res.json(toResultError({ statusCode: 403, msg: MESSAGE.FORBIDDEN }));
    return null;
  }

  return user;
};

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
    const { userId } = req.params;
    const user = await ensureCandidateUser(res, userId);
    if (!user) return;

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
    const { userId } = req.params;
    const user = await ensureCandidateUser(res, userId);
    if (!user) return;

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
    const { userId } = req.params;
    const user = await ensureCandidateUser(res, userId);
    if (!user) return;

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
    const { userId } = req.params;
    const user = await ensureCandidateUser(res, userId);
    if (!user) return;

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
    const { userId } = req.params;
    const { social } = req.body;

    if (!Array.isArray(social))
      return res.json(toResultError({ statusCode: 400, msg: MESSAGE.FIELD_REQUIRED }));

    const profile = await Profile.findOne({ user: userId });
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
        msg: MESSAGE.CANDIDATE_SOCIAL_ADD_SUCCESS,
        data: profile.social,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SOCIAL_ADD_FAILED })
    );
  }
};

export const updateCandidateSocial = async (req, res) => {
  try {
    const { userId } = req.params;
    const { platform, url } = req.body;

    if (!platform || !url)
      return res.json(toResultError({ statusCode: 400, msg: MESSAGE.FIELD_REQUIRED }));

    if (!SUPPORTED_SOCIAL_PLATFORMS.includes(platform))
      return res.json(
        toResultError({ statusCode: 400, msg: MESSAGE.UNSUPPORTED_SOCIAL_PLATFORM })
      );

    const user = await ensureCandidateUser(res, userId);
    if (!user) return;

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
    const { userId } = req.params;
    const { platform } = req.body;

    if (!platform)
      return res.json(toResultError({ statusCode: 400, msg: MESSAGE.FIELD_REQUIRED }));

    const profile = await Profile.findOne({ user: userId });
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
    const { userId } = req.params;
    const user = await ensureCandidateUser(res, userId);
    if (!user) return;

    const applications = await Application.find({ candidate: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        populate: [
          { path: "company", select: "name logo" },
          { path: "category", select: "name" },
          { path: "tags", select: "name" },
        ],
      })
      .lean();

    const appliedJobs = applications
      .filter((application) => application.job)
      .map((application) => ({
        applicationId: application._id,
        status: application.status || null,
        resume: application.resume || "",
        coverLetter: application.coverLetter || "",
        appliedAt: application.createdAt,
        job: application.job,
      }));

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

export const getInfoCandidate = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await ensureCandidateUser(res, userId);
    if (!user) return;
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
    const { userId } = req.params;
    const { firstName, lastName, phoneNumber } = req.body;
    const user = await ensureCandidateUser(res, userId);
    if (!user) return;
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
