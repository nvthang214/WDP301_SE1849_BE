import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import Recruiter from '../models/Recruiter.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOkWithMessageAndData, toResultError } from '../results/Result.js';

export const getProfile = async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select('-Password');
  if (!user) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }));
  }

  let profileData = { ...user.toObject() };

  if (user.Role === 'candidate') {
    const candidateProfile = await Candidate.findOne({ user_id: userId });
    if (candidateProfile) {
      profileData = { ...profileData, ...candidateProfile.toObject() };
    }
  } else if (user.Role === 'recruiter') {
    const recruiterProfile = await Recruiter.findOne({ user_id: userId });
    if (recruiterProfile) {
      profileData = { ...profileData, ...recruiterProfile.toObject() };
    }
  }

  res.json(
    toResultOkWithMessageAndData({
      msg: MESSAGE.USER_PROFILE_FETCH_SUCCESS,
      data: profileData,
    })
  );
};

export const updateProfile = async (req, res) => {
  const userId = req.user._id;
  const { FullName, phone_number, ...profileDetails } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { FullName, phone_number },
    { new: true }
  ).select('-Password');

  if (!user) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }));
  }

  let profileData = { ...user.toObject() };

  if (user.Role === 'candidate') {
    const { profile, avatar, experience_years, skills, cv } = profileDetails;
    const candidateProfile = await Candidate.findOneAndUpdate(
      { user_id: userId },
      { profile, avatar, experience_years, skills, cv },
      { new: true, upsert: true }
    );
    if (candidateProfile) {
      profileData = { ...profileData, ...candidateProfile.toObject() };
    }
  } else if (user.Role === 'recruiter') {
    const { position } = profileDetails;
    const recruiterProfile = await Recruiter.findOneAndUpdate(
      { user_id: userId },
      { position },
      { new: true, upsert: true }
    );
    if (recruiterProfile) {
      profileData = { ...profileData, ...recruiterProfile.toObject() };
    }
  }

  res.json(
    toResultOkWithMessageAndData({
      msg: MESSAGE.USER_PROFILE_UPDATE_SUCCESS,
      data: profileData,
    })
  );
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-Password');
  if (!user) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }));
  }

  // In a real app, you might want to check if the requester is an admin here.
  let profileData = { ...user.toObject() };

  if (user.Role === 'candidate') {
    const candidateProfile = await Candidate.findOne({ user_id: id });
    if (candidateProfile) {
      profileData = { ...profileData, ...candidateProfile.toObject() };
    }
  } else if (user.Role === 'recruiter') {
    const recruiterProfile = await Recruiter.findOne({ user_id: id });
    if (recruiterProfile) {
      profileData = { ...profileData, ...recruiterProfile.toObject() };
    }
  }

  res.json(
    toResultOkWithMessageAndData({
      msg: MESSAGE.USER_PROFILE_FETCH_SUCCESS,
      data: profileData,
    })
  );
};