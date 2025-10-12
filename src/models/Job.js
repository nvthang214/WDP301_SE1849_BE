<<<<<<< HEAD

import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  
  title: { type: String, required: true },
  description: { type: String },
  tags: { type: String }, 
=======
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company' 
  },
  recruiter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { type: String },
  tags: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tag'
  },
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
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
<<<<<<< HEAD
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
=======
  applyType: { type: String, default: "Jobpilot" },  
  requirements: { type: String },
  desirable: { type: String },
  location: { type: String },
  isActive: { type: Boolean, default: true }
},
{ timestamps: true }
);



export default mongoose.model('Job', JobSchema);
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
