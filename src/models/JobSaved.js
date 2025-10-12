import mongoose from 'mongoose';

const JobSavedSchema = new mongoose.Schema({
<<<<<<< HEAD
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
=======
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  saved_at: { type: Date, default: Date.now }
});

<<<<<<< HEAD
export default mongoose.model('JobSaved', JobSavedSchema);
=======
const JobSaved = mongoose.model('JobSaved', JobSavedSchema);
export default JobSaved;
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
