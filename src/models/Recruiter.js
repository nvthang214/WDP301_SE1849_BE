import mongoose from 'mongoose';

const RecruiterSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  position: { type: String }
});

const Recruiter = mongoose.model('Recruiter', RecruiterSchema);
export default Recruiter;