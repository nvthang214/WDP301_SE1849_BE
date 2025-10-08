
const mongoose = require('mongoose');

const JobAnalysisSchema = new mongoose.Schema({
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  match_score: { type: Number },
  analysis_details: { type: String },
  analysis_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobAnalysis', JobAnalysisSchema);
