
import mongoose from 'mongoose';

const JobAnalysisSchema = new mongoose.Schema({
<<<<<<< HEAD
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
=======
  candidate_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  job_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
  match_score: { type: Number },
  analysis_details: { type: String },
  analysis_at: { type: Date, default: Date.now }
});

export default mongoose.model('JobAnalysis', JobAnalysisSchema);
