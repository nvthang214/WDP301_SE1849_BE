import express from 'express';
import { viewApplicationStatus, importCV, deleteCV, applyJob } from '../controllers/appstatus.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Xem trạng thái của các đơn xin việc đã nộp
router.get('/application-status', authMiddleware, viewApplicationStatus);

//Nhập CV mới để ứng tuyển
router.post('/cv', authMiddleware, importCV);

// Xóa CV hiện tại của user 
router.delete('/cv', authMiddleware, deleteCV);

// Ứng viên nộp đơn ứng tuyển sử dụng CV đã tạo hoặc upload
router.post('/apply', authMiddleware, applyJob);

export default router;
