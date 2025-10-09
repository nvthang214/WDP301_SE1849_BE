
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  title: { type: String, required: true },
  description: { type: String },
  requirements: { type: String },
  benefits: { type: String },
  salary_min: { type: Number },
  salary_max: { type: Number },
  location: { type: String },
  job_type: { type: String },
  experience_level: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
});

export default mongoose.model('Job', JobSchema);
