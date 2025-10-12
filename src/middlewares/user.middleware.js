import { MESSAGE } from "../constants/message.js";
import ErrorResponse from "../lib/helper/ErrorResponse.js";
import User from "../models/User.js";

/**
 * Middleware tải đầy đủ thông tin người dùng từ database dựa trên req.user (đã giải mã từ JWT).
 * - Kiểm tra người dùng có tồn tại không.
 * - Kiểm tra trạng thái hoạt động (bị khóa/banned hay không).
 * - Gán đối tượng user đầy đủ vào req.user để các middleware/controller phía sau sử dụng.
 */
export const userMiddleware = async (req, res, next) => {
  try {
    const user_raw = req.user;
    const user = await User.findById(user_raw._id).populate("role_id", "name");
    if (!user) throw new ErrorResponse(401, MESSAGE.USER_NOT_FOUND);
    if (!user.isActive) throw new ErrorResponse(423, MESSAGE.USER_BANNED);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
