
const mongoose = require('mongoose');

const JobSavedSchema = new mongoose.Schema({
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  saved_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobSaved', JobSavedSchema);
