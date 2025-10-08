
const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile: { type: String },
  avatar: { type: String },
  experience_years: { type: Number },
  skills: { type: String },
  cv: { type: String }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
