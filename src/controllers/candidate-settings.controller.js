import mongoose from 'mongoose';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import Profile from '../models/Profile.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOk, toResultError } from '../results/Result.js';

const { Types } = mongoose;

const generateId = () => new Types.ObjectId().toString();

const parseCandidateProfileMeta = (rawValue) => {
  if (!rawValue) {
    return {};
  }

  if (typeof rawValue === 'object') {
    return { ...rawValue };
  }

  if (typeof rawValue !== 'string') {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return { headline: rawValue };
  }

  return { headline: rawValue };
};

const parseCandidateMeta = (rawValue) => {
  if (!rawValue) {
    return {};
  }

  if (typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    return { ...rawValue };
  }

  if (typeof rawValue !== 'string') {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    return { legacySkills: rawValue };
  }

  return { legacySkills: rawValue };
};

const parseResumeSource = (rawValue) => {
  if (!rawValue) {
    return [];
  }

  if (Array.isArray(rawValue)) {
    return [...rawValue];
  }

  if (typeof rawValue === 'object') {
    return [rawValue];
  }

  if (typeof rawValue !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === 'object') {
      return [parsed];
    }
  } catch (error) {
    return [rawValue];
  }

  return [rawValue];
};

const normaliseResume = (resume) => {
  if (!resume) {
    return null;
  }

  if (typeof resume === 'string') {
    const filename = resume.split('/').pop();
    const timestamp = new Date().toISOString();
    return {
      id: generateId(),
      name: filename || resume,
      fileUrl: resume,
      size: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  if (typeof resume !== 'object') {
    return null;
  }

  const id = typeof resume.id === 'string'
    ? resume.id
    : typeof resume._id === 'string'
      ? resume._id
      : generateId();

  const createdAt = resume.createdAt ? new Date(resume.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = resume.updatedAt ? new Date(resume.updatedAt).toISOString() : createdAt;

  return {
    id,
    name: resume.name || resume.fileName || resume.title || resume.fileUrl || '',
    fileUrl: resume.fileUrl || resume.url || '',
    size: resume.size ?? null,
    createdAt,
    updatedAt,
  };
};

const readResumeLibrary = (rawValue) =>
  parseResumeSource(rawValue)
    .map((item) => normaliseResume(item))
    .filter((item) => item && item.fileUrl);

const serialiseResumeLibrary = (items) => JSON.stringify(items);

const buildPersonalResponse = ({ user, candidate, profile, resumes, meta }) => {
  const profileMeta = parseCandidateProfileMeta(candidate?.profile);

  return {
    avatar: candidate?.avatar ?? user.avatar ?? null,
    fullName: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    email: user.email,
    phoneNumber: user.phoneNumber ?? '',
    headline: profileMeta.headline ?? '',
    personalWebsite: profileMeta.personalWebsite ?? '',
    experience: profile?.experience ?? '',
    education: profile?.education ?? '',
    resumes,
    legacy: {
      skills: meta.legacySkills ?? null,
    },
  };
};

export const getCandidatePersonalSettings = async (req, res) => {
  const { candidateId } = req.params;

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  try {
    const user = await User.findById(candidateId).select('-password');

    if (!user) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND })
      );
    }

    const [candidate, profile] = await Promise.all([
      Candidate.findOne({ user_id: candidateId }),
      Profile.findOne({ user: candidateId }),
    ]);

    const meta = parseCandidateMeta(candidate?.skills);
    const resumes = readResumeLibrary(candidate?.cv);

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SETTINGS_PERSONAL_FETCH_SUCCESS,
        data: buildPersonalResponse({ user, candidate, profile, resumes, meta }),
      })
    );
  } catch (error) {
    console.error('[getCandidatePersonalSettings] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SETTINGS_PERSONAL_FETCH_FAILED })
    );
  }
};

export const updateCandidatePersonalSettings = async (req, res) => {
  const { candidateId } = req.params;
  const {
    firstName,
    lastName,
    phoneNumber,
    avatar,
    headline,
    personalWebsite,
    experience,
    education,
  } = req.body || {};

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  try {
    const user = await User.findById(candidateId);

    if (!user) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND })
      );
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    let candidate = await Candidate.findOne({ user_id: candidateId });
    if (!candidate) {
      candidate = new Candidate({ user_id: candidateId });
    }

    if (avatar !== undefined) {
      candidate.avatar = avatar;
    }

    const profileMeta = parseCandidateProfileMeta(candidate.profile);
    if (headline !== undefined) {
      profileMeta.headline = headline;
    }
    if (personalWebsite !== undefined) {
      profileMeta.personalWebsite = personalWebsite;
    }
    candidate.profile = JSON.stringify(profileMeta);

    await candidate.save();

    const profileUpdate = {};
    if (experience !== undefined) {
      profileUpdate.experience = experience;
    }
    if (education !== undefined) {
      profileUpdate.education = education;
    }

    const profile = Object.keys(profileUpdate).length
      ? await Profile.findOneAndUpdate(
          { user: candidateId },
          profileUpdate,
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
      : await Profile.findOne({ user: candidateId });

    const meta = parseCandidateMeta(candidate.skills);
    const resumes = readResumeLibrary(candidate.cv);

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SETTINGS_PERSONAL_UPDATE_SUCCESS,
        data: buildPersonalResponse({ user, candidate, profile, resumes, meta }),
      })
    );
  } catch (error) {
    console.error('[updateCandidatePersonalSettings] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SETTINGS_PERSONAL_UPDATE_FAILED })
    );
  }
};

export const createCandidateResume = async (req, res) => {
  const { candidateId } = req.params;
  const { name, fileUrl, size } = req.body || {};

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  if (!name || !fileUrl) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.INVALID_RESUME_PAYLOAD })
    );
  }

  try {
    let candidate = await Candidate.findOne({ user_id: candidateId });
    if (!candidate) {
      candidate = new Candidate({ user_id: candidateId });
    }

    const resumes = readResumeLibrary(candidate.cv);

    const now = new Date().toISOString();
    const resumeObject = {
      id: generateId(),
      name,
      fileUrl,
      size: size ?? null,
      createdAt: now,
      updatedAt: now,
    };

    resumes.push(resumeObject);

    candidate.cv = serialiseResumeLibrary(resumes);
    await candidate.save();

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_RESUME_CREATE_SUCCESS,
        data: { resumes },
      })
    );
  } catch (error) {
    console.error('[createCandidateResume] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_RESUME_CREATE_FAILED })
    );
  }
};

export const updateCandidateResume = async (req, res) => {
  const { candidateId, resumeId } = req.params;
  const { name, fileUrl, size } = req.body || {};

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId) || !resumeId) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  try {
    const candidate = await Candidate.findOne({ user_id: candidateId });

    if (!candidate) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.CANDIDATE_NOT_FOUND })
      );
    }

    const resumes = readResumeLibrary(candidate.cv);
    const index = resumes.findIndex((item) => item.id === resumeId);

    if (index === -1) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.RESUME_NOT_FOUND })
      );
    }

    const current = resumes[index];
    resumes[index] = {
      ...current,
      name: name ?? current.name,
      fileUrl: fileUrl ?? current.fileUrl,
      size: size ?? current.size,
      updatedAt: new Date().toISOString(),
    };

    candidate.cv = serialiseResumeLibrary(resumes);
    await candidate.save();

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_RESUME_UPDATE_SUCCESS,
        data: { resumes },
      })
    );
  } catch (error) {
    console.error('[updateCandidateResume] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_RESUME_UPDATE_FAILED })
    );
  }
};

export const deleteCandidateResume = async (req, res) => {
  const { candidateId, resumeId } = req.params;

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId) || !resumeId) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  try {
    const candidate = await Candidate.findOne({ user_id: candidateId });

    if (!candidate) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.CANDIDATE_NOT_FOUND })
      );
    }

    const resumes = readResumeLibrary(candidate.cv);
    const filtered = resumes.filter((item) => item.id !== resumeId);

    if (filtered.length === resumes.length) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.RESUME_NOT_FOUND })
      );
    }

    candidate.cv = serialiseResumeLibrary(filtered);
    await candidate.save();

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_RESUME_DELETE_SUCCESS,
        data: { resumes: filtered },
      })
    );
  } catch (error) {
    console.error('[deleteCandidateResume] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_RESUME_DELETE_FAILED })
    );
  }
};

const buildProfileResponse = ({ profile, meta }) => ({
  nationality: meta.nationality ?? '',
  dateOfBirth: meta.dateOfBirth ?? '',
  gender: meta.gender ?? '',
  maritalStatus: meta.maritalStatus ?? '',
  education: profile?.education ?? '',
  experience: profile?.experience ?? '',
  biography: profile?.bio ?? '',
});

export const getCandidateProfileSettings = async (req, res) => {
  const { candidateId } = req.params;

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  try {
    const [candidate, profile] = await Promise.all([
      Candidate.findOne({ user_id: candidateId }),
      Profile.findOne({ user: candidateId }),
    ]);

    if (!candidate && !profile) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.CANDIDATE_NOT_FOUND })
      );
    }

    const meta = parseCandidateMeta(candidate?.skills);

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SETTINGS_PROFILE_FETCH_SUCCESS,
        data: buildProfileResponse({ profile, meta }),
      })
    );
  } catch (error) {
    console.error('[getCandidateProfileSettings] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SETTINGS_PROFILE_FETCH_FAILED })
    );
  }
};

export const updateCandidateProfileSettings = async (req, res) => {
  const { candidateId } = req.params;
  const {
    nationality,
    dateOfBirth,
    gender,
    maritalStatus,
    education,
    experience,
    biography,
  } = req.body || {};

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  try {
    let candidate = await Candidate.findOne({ user_id: candidateId });
    if (!candidate) {
      candidate = new Candidate({ user_id: candidateId });
    }

    const meta = parseCandidateMeta(candidate.skills);

    if (nationality !== undefined) {
      meta.nationality = nationality;
    }
    if (dateOfBirth !== undefined) {
      meta.dateOfBirth = dateOfBirth;
    }
    if (gender !== undefined) {
      meta.gender = gender;
    }
    if (maritalStatus !== undefined) {
      meta.maritalStatus = maritalStatus;
    }

    candidate.skills = JSON.stringify(meta);
    await candidate.save();

    const profileUpdate = {};
    if (education !== undefined) {
      profileUpdate.education = education;
    }
    if (experience !== undefined) {
      profileUpdate.experience = experience;
    }
    if (biography !== undefined) {
      profileUpdate.bio = biography;
    }

    const profile = Object.keys(profileUpdate).length
      ? await Profile.findOneAndUpdate(
          { user: candidateId },
          profileUpdate,
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
      : await Profile.findOne({ user: candidateId });

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SETTINGS_PROFILE_UPDATE_SUCCESS,
        data: buildProfileResponse({ profile, meta }),
      })
    );
  } catch (error) {
    console.error('[updateCandidateProfileSettings] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SETTINGS_PROFILE_UPDATE_FAILED })
    );
  }
};

const buildSocialLinksResponse = (meta) => {
  const socialLinks = Array.isArray(meta.socialLinks) ? meta.socialLinks : [];
  return socialLinks.map((link) => ({
    id: link.id || generateId(),
    platform: link.platform || '',
    url: link.url || '',
  }));
};

export const getCandidateSocialLinks = async (req, res) => {
  const { candidateId } = req.params;

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  try {
    const candidate = await Candidate.findOne({ user_id: candidateId });

    if (!candidate) {
      return res.json(
        toResultError({ statusCode: 404, msg: MESSAGE.CANDIDATE_NOT_FOUND })
      );
    }

    const meta = parseCandidateMeta(candidate.skills);

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SETTINGS_SOCIAL_FETCH_SUCCESS,
        data: buildSocialLinksResponse(meta),
      })
    );
  } catch (error) {
    console.error('[getCandidateSocialLinks] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SETTINGS_SOCIAL_FETCH_FAILED })
    );
  }
};

export const updateCandidateSocialLinks = async (req, res) => {
  const { candidateId } = req.params;
  const { links } = req.body || {};

  if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.VALIDATION_ERROR })
    );
  }

  if (!Array.isArray(links)) {
    return res.json(
      toResultError({ statusCode: 400, msg: MESSAGE.INVALID_SOCIAL_LINK_PAYLOAD })
    );
  }

  try {
    let candidate = await Candidate.findOne({ user_id: candidateId });
    if (!candidate) {
      candidate = new Candidate({ user_id: candidateId });
    }

    const meta = parseCandidateMeta(candidate.skills);

    meta.socialLinks = links
      .map((link) => ({
        id: link.id || generateId(),
        platform: link.platform || '',
        url: link.url || '',
      }))
      .filter((link) => link.platform && link.url);

    candidate.skills = JSON.stringify(meta);
    await candidate.save();

    return res.json(
      toResultOk({
        msg: MESSAGE.CANDIDATE_SETTINGS_SOCIAL_UPDATE_SUCCESS,
        data: buildSocialLinksResponse(meta),
      })
    );
  } catch (error) {
    console.error('[updateCandidateSocialLinks] error:', error);
    return res.json(
      toResultError({ statusCode: 500, msg: MESSAGE.CANDIDATE_SETTINGS_SOCIAL_UPDATE_FAILED })
    );
  }
};
