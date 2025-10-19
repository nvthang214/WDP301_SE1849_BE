import Profile from "../models/Profile.js";
import { MESSAGE } from "../constants/message.js";
import { toResultError, toResultOk } from "../results/Result.js";
import User from "../models/User.js";

const SUPPORTED_SOCIAL_PLATFORMS = [
  "linkedin",
  "twitter",
  "facebook",
  "instagram",
  "youtube",
];

export const getCandidateSocial = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("role", "name");

    if (!user)
      return res.json(toResultError({ statusCode: 404, msg: MESSAGE.USER_NOT_FOUND }));

    if (user.role?.name !== "candidate")
      return res.json(toResultError({ statusCode: 403, msg: MESSAGE.FORBIDDEN }));

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

    const profile = await Profile.findOne({ user: userId });
    if (!profile)
      return res.json(toResultError({ statusCode: 404, msg: MESSAGE.PROFILE_NOT_FOUND }));

    profile.social[platform] = url;
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
