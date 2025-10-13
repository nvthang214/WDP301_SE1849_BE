import { config } from 'dotenv';
import { MESSAGE } from '../constants/message.js';
import User from '../models/User.js';
import { toResultOk } from '../results/Result.js';
import Role from '../models/Role.js';
import ErrorResponse from '../lib/helper/ErrorResponse.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { TOKEN_EXPIRATION } from '../constants/variable.js';
config();

/**
 * Controller for user registration.
 * Handles creating a new user with default "user" role.
 * Responds with success message on successful registration.
 */
export const registerController = async (req, res) => {
  let { username, email, password, firstName, lastName } = req.body;
  const role = await Role.findOne({ name: 'candidate' });
  const newUser = new User({
    role: role._id,
    username,
    email,
    password,
    firstName,
    lastName,
  });

  await newUser.save();

  return res.status(201).json(
    toResultOk({
      msg: MESSAGE.REGISTER_SUCCESS,
      statusCode: 201,
    })
  );
};

/**
 * Controller for user login.
 * Verifies credentials, generates JWT tokens,
 * sets refresh token as httpOnly cookie, and returns access token.
 */
export const loginController = async (req, res) => {
  let { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password)))
    throw new ErrorResponse(401, MESSAGE.LOGIN_FAILED);

  const payload = { userId: user._id.toString(), username: user.username };
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  const days = Number(TOKEN_EXPIRATION.REFRESH_EXPIRES.split('d')[0]);
  const refreshTokenExpiry = 1000 * 60 * 60 * 24 * days;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: refreshTokenExpiry,
    sameSite: 'Strict',
  });
  return res.status(200).json(
    toResultOk({
      msg: MESSAGE.LOGIN_SUCCESS,
      data: {
        token: accessToken,
      },
    })
  );
};
