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
