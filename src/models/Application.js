import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
<<<<<<< HEAD
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String },
  createdAt: { type: Date, default: Date.now }
});
=======
  candidate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true 
  },
  job: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', required: true 
  },
  resume : { type: String },
  coverLetter: { type: String },
  status: { type: String }
},
{ timestamps: true }
);
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d

export default mongoose.model('Application', ApplicationSchema);