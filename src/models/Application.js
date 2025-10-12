import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: ['pending', 'viewed', 'shortlisted', 'rejected', 'hired'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Application', ApplicationSchema);