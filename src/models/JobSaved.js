import mongoose from 'mongoose';

const JobSavedSchema = new mongoose.Schema({
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  saved_at: { type: Date, default: Date.now }
});

export default mongoose.model('JobSaved', JobSavedSchema);
