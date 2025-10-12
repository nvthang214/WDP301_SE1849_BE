import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { toResultError } from '../results/Result.js';
import { MESSAGE } from '../constants/message.js';

export const isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.json(toResultError({ statusCode: 401, msg: MESSAGE.AUTHENTICATION_REQUIRED }));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-Password');

    if (!user) {
      return res.json(toResultError({ statusCode: 401, msg: MESSAGE.INVALID_TOKEN }));
    }

    req.user = user;
    next();
} catch (error) {
    return res.json(toResultError({ statusCode: 401, msg: MESSAGE.INVALID_TOKEN }));
  }
};
