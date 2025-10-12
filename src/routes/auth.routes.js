// auth.routes.js
import express from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller.js";
import {
  loginValidator,
  registerValidator,
} from "../middlewares/auth.middleware.js";
import { wrapAsync } from "../middlewares/error.middleware.js";
const authRoutes = express.Router();

// Đăng ký tài khoản
authRoutes.post("/register", registerValidator, wrapAsync(registerController));

// Đăng nhập
authRoutes.post("/login", loginValidator, wrapAsync(loginController));

// // Đăng nhập bằng Google OAuth
// authRoutes.post("/google", googleLogin);

// Refresh access token
// authRoutes.post("/refresh-token", refreshToken);

// // Xác minh email
// authRoutes.get("/verify-email/:token", verifyEmail);

// // Quên mật khẩu (gửi mail reset)
// authRoutes.post("/forgot-password", forgotPassword);

// // Đặt lại mật khẩu bằng token
// authRoutes.post("/reset-password/:token", resetPassword);

// // Đổi mật khẩu (khi đang đăng nhập)
// authRoutes.post("/change-password", authenticate, changePassword);

// Đăng xuất (xóa refresh token)
// authRoutes.post("/logout", logout);

export default authRoutes;
