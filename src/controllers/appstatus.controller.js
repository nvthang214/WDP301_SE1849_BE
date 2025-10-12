import Application from '../models/Application.js';
import Candidate from '../models/Candidate.js';
import { MESSAGE } from '../constants/message.js';

// View the status of submitted job applications
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

// Import (create/update) a new CV for applying job
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
		return res.status(200).json({ message: 'CV imported successfully', candidate });
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.SYSTEM_ERROR });
	}
};

// Delete own existing CV
export const deleteCV = async (req, res) => {
	try {
		const userId = req.user._id;
		const candidate = await Candidate.findOne({ user_id: userId });
		if (!candidate) {
			return res.status(404).json({ message: MESSAGE.NOT_FOUND });
		}
		candidate.cv = undefined;
		await candidate.save();
		return res.status(200).json({ message: 'CV deleted successfully' });
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.SYSTEM_ERROR });
	}
};
