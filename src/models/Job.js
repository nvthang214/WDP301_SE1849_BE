
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  
  title: { type: String, required: true },
  description: { type: String },
  tags: { type: String }, 
  role: { type: String },
  minSalary: { type: Number },
  maxSalary: { type: Number },
  salaryType: { type: String },
  education: { type: String },
  experience: { type: String },
  jobType: { type: String },
  vacancies: { type: Number },
  expiration: { type: Date },
  jobLevel: { type: String },
  country: { type: String },
  city: { type: String },
  remote: { type: Boolean, default: false },
  benefits: { type: [String] },
  applyType: { type: String, default: "Jobpilot" },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter' },
  requirements: { type: String },
  desirable: { type: String },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Job', JobSchema);
