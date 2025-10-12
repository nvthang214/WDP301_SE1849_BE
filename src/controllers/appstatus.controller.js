import Application from '../models/Application.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import { MESSAGE } from '../constants/message.js';

// Xem trạng thái của các đơn xin việc đã nộp
export const viewApplicationStatus = async (req, res) => {
	try {
		const userId = req.user._id;
		const candidate = await Candidate.findOne({ user_id: userId });
		if (!candidate) {
			return res.status(404).json({ message: MESSAGE.NOT_FOUND });
		}
		const applications = await Application.find({ candidate_id: candidate._id })
			.populate('job_id');
		return res.status(200).json({ applications });
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.SYSTEM_ERROR });
	}
};

// Nhập CV mới để ứng tuyển
export const importCV = async (req, res) => {
	try {
		const userId = req.user._id;
		const { cv } = req.body;
		if (!cv) {
			return res.status(400).json({ message: MESSAGE.FIELD_REQUIRED });
		}
		const candidate = await Candidate.findOneAndUpdate(
			{ user_id: userId },
			{ cv },
			{ new: true }
		);
		if (!candidate) {
			return res.status(404).json({ message: MESSAGE.NOT_FOUND });
		}
		return res.status(200).json({ message: MESSAGE.CV_IMPORT_SUCCESS, candidate });
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.CV_IMPORT_FAILED });
	}
};

// Xóa CV hiện tại của user 
export const deleteCV = async (req, res) => {
	try {
		const userId = req.user._id;
		const candidate = await Candidate.findOne({ user_id: userId });
		if (!candidate) {
			return res.status(404).json({ message: MESSAGE.NOT_FOUND });
		}
		candidate.cv = undefined;
		await candidate.save();
		return res.status(200).json({ message: MESSAGE.CV_DELETE_SUCCESS });
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.CV_DELETE_FAILED });
	}
};

// Ứng viên nộp đơn ứng tuyển sử dụng CV đã tạo hoặc upload
export const applyJob = async (req, res) => {
	try {
		const userId = req.user._id;
		const { job_id, coverLetter } = req.body;
		if (!job_id) {
			return res.status(400).json({ message: 'Job ID is required' });
		}
		const candidate = await Candidate.findOne({ user_id: userId });
		if (!candidate) {
			return res.status(404).json({ message: MESSAGE.NOT_FOUND });
		}
		if (!candidate.cv) {
			return res.status(400).json({ message: 'Bạn cần tạo hoặc upload CV trước khi ứng tuyển.' });
		}
		const job = await Job.findById(job_id);
		if (!job) {
			return res.status(404).json({ message: 'Job not found' });
		}
		const existed = await Application.findOne({ candidate_id: candidate._id, job_id });
		if (existed) {
			return res.status(400).json({ message: 'Bạn đã ứng tuyển công việc này rồi.' });
		}
		const application = await Application.create({
			candidate_id: candidate._id,
			job_id,
			status: 'pending',
			coverLetter: coverLetter || '',
		});
		return res.status(201).json({ message: 'Ứng tuyển thành công', application });
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.SYSTEM_ERROR });
	}
};
