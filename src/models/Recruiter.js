<<<<<<< HEAD
import mongoose from "mongoose";

const RecruiterSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  position: { type: String },
});

export default mongoose.model("Recruiter", RecruiterSchema);
=======
import mongoose from 'mongoose';

const RecruiterSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  position: { type: String }
});

const Recruiter = mongoose.model('Recruiter', RecruiterSchema);
export default Recruiter;
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
