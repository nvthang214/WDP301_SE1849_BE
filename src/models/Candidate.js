
<<<<<<< HEAD

=======
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profile: { type: String },
  avatar: { type: String },
  experience_years: { type: Number },
  skills: { type: String },
  cv: { type: String }
});

export default mongoose.model('Candidate', CandidateSchema);
