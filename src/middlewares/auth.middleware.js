import validator from "validator";
import { MESSAGE } from "../constants/message.js";
import ErrorResponse from "../lib/helper/ErrorResponse.js";
import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Middleware xác thực JWT cho các route yêu cầu đăng nhập.
 * Nếu token hợp lệ, thông tin user sẽ được gán vào req.user.
 * Nếu không hợp lệ, trả về lỗi 401 Unauthorized.
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ErrorResponse(401, MESSAGE.JWT_INVALID));
  }

  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    req.user = payload;
    next();
  } catch (error) {
    next(new ErrorResponse(401, MESSAGE.JWT_INVALID));
  }
};

/**
 * Middleware xác thực dữ liệu đầu vào khi đăng ký tài khoản.
 * Kiểm tra các trường bắt buộc, định dạng email, độ dài mật khẩu,
 * và kiểm tra trùng lặp email/username trong database.
 */
export const registerValidator = async (req, res, next) => {
  try {
    let { username, email, password, firstName, lastName } = req.body;

    // Trim dữ liệu đầu vào
    username = username?.trim();
    email = email?.trim();
    password = password?.trim();
    firstName = firstName?.trim();
    lastName = lastName?.trim();

    // --- Kiểm tra các trường bắt buộc ---
    if (!username || !email || !password || !firstName || !lastName)
      throw new ErrorResponse(400, MESSAGE.FIELD_REQUIRED);

    if (!validator.isEmail(email))
      throw new ErrorResponse(400, MESSAGE.EMAIL_INVALID);

    if (password.length < 6)
      throw new ErrorResponse(400, MESSAGE.PASSWORD_TOO_SHORT);

    // --- Kiểm tra trùng email / username ---
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    if (existingEmail) throw new ErrorResponse(400, MESSAGE.EMAIL_EXISTED);

    if (existingUsername)
      throw new ErrorResponse(400, MESSAGE.USERNAME_EXISTED);

    // Gán lại giá trị đã trim vào req.body (để controller sử dụng)
    req.body = {
      username,
      email,
      password,
      firstName,
      lastName,
    };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware xác thực dữ liệu đầu vào khi đăng nhập.
 * Kiểm tra các trường bắt buộc và độ dài mật khẩu.
 */
export const loginValidator = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Trim dữ liệu đầu vào
    const trimmedUsername = username?.trim();
    const trimmedPassword = password?.trim();

    // Kiểm tra các trường bắt buộc
    if (!trimmedUsername || !trimmedPassword) {
      throw new ErrorResponse(400, MESSAGE.FIELD_REQUIRED);
    }

    // Kiểm tra độ dài mật khẩu
    if (trimmedPassword.length < 6) {
      throw new ErrorResponse(400, MESSAGE.PASSWORD_TOO_SHORT);
    }

    next();
  } catch (error) {
    next(error);
  }
};