import Application from '../models/Application.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import mongoose from 'mongoose';

// Apply for a job using a created or uploaded CV
export const applyJob = async (req, res) => {
	try {
		const { job_id, candidate_id, cv } = req.body;
		if (!job_id || !candidate_id) {
			return res.status(400).json({ message: 'Missing job_id or candidate_id' });
		}
		// Check if job exists
		const job = await Job.findById(job_id);
		if (!job) return res.status(404).json({ message: 'Job not found' });
		// Check if candidate exists
		const candidate = await Candidate.findById(candidate_id);
		if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
		// Optionally update candidate CV
		if (cv) {
			candidate.cv = cv;
			await candidate.save();
		}
		// Check if already applied
		const exist = await Application.findOne({ candidate_id, job_id });
		if (exist) return res.status(409).json({ message: 'Already applied' });
		// Create application
		const application = new Application({ candidate_id, job_id, status: 'pending' });
		await application.save();
		res.status(201).json({ message: 'Application submitted', application });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// View status of submitted job applications
export const viewApplicationStatus = async (req, res) => {
	try {
		const { candidate_id } = req.params;
		if (!candidate_id) return res.status(400).json({ message: 'Missing candidate_id' });
		const applications = await Application.find({ candidate_id }).populate('job_id');
		res.status(200).json({ applications });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Import/Create new CV for candidate
export const importCV = async (req, res) => {
	try {
		const { candidate_id, cv } = req.body;
		if (!candidate_id || !cv) return res.status(400).json({ message: 'Missing candidate_id or cv' });
		const candidate = await Candidate.findById(candidate_id);
		if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
		candidate.cv = cv;
		await candidate.save();
		res.status(200).json({ message: 'CV imported', candidate });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Delete candidate's existing CV
export const deleteCV = async (req, res) => {
	try {
		const { candidate_id } = req.body;
		if (!candidate_id) return res.status(400).json({ message: 'Missing candidate_id' });
		const candidate = await Candidate.findById(candidate_id);
		if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
		candidate.cv = undefined;
		await candidate.save();
		res.status(200).json({ message: 'CV deleted', candidate });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
