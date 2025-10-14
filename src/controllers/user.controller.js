import User from '../models/User.js';
import { MESSAGE } from '../constants/message.js';
import { toResultOk, toResultError } from '../results/Result.js';

export const getProfile = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).populate('role').select('-password');
  if (!user) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }));
  }

  let profileData = { ...user.toObject() };

  if (user.role.name === 'user') {
    const candidateProfile = await Candidate.findOne({ user_id: userId });
    if (candidateProfile) {
      profileData = { ...profileData, ...candidateProfile.toObject() };
    }
  } else if (user.role.name === 'recruiter') {
    const recruiterProfile = await Recruiter.findOne({ user_id: userId });
    if (recruiterProfile) {
      profileData = { ...profileData, ...recruiterProfile.toObject() };
    }
  }

  res.json(
    toResultOk({
      msg: MESSAGE.USER_PROFILE_FETCH_SUCCESS,
      data: profileData,
    })
  );
};

export const updateProfile = async (req, res) => {
  const userId = req.user?._id || req.params.userId;
  const { firstName, lastName, phoneNumber, ...profileDetails } = req.body;

  const user = await User.findById(userId).populate('role');

  if (!user) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }));
  }

  // Update user fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  
  await user.save();

  // Exclude password from the response
  const userObject = user.toObject();
  delete userObject.password;

  let profileData = { ...userObject };

  if (user.role.name === 'user') {
    const { profile, avatar, experience_years, skills, cv } = profileDetails;
    const candidateProfile = await Candidate.findOneAndUpdate(
      { user_id: userId },
      { profile, avatar, experience_years, skills, cv },
      { new: true, upsert: true }
    );
    if (candidateProfile) {
      profileData = { ...profileData, ...candidateProfile.toObject() };
    }
  } else if (user.role.name === 'recruiter') {
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
    toResultOk({
      msg: MESSAGE.USER_PROFILE_UPDATE_SUCCESS,
      data: profileData,
    })
  );
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).populate('role').select('-password');
  if (!user) {
    return res.json(toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }));
  }

  // In a real app, you might want to check if the requester is an admin here.
  let profileData = { ...user.toObject() };

  if (user.role.name === 'user') {
    const candidateProfile = await Candidate.findOne({ user_id: id });
    if (candidateProfile) {
      profileData = { ...profileData, ...candidateProfile.toObject() };
    }
  } else if (user.role.name === 'recruiter') {
    const recruiterProfile = await Recruiter.findOne({ user_id: id });
    if (recruiterProfile) {
      profileData = { ...profileData, ...recruiterProfile.toObject() };
    }
  }

  res.json(
    toResultOk({
      msg: MESSAGE.USER_PROFILE_FETCH_SUCCESS,
      data: profileData,
    })
  );
};