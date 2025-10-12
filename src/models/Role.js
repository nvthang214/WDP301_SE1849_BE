import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
<<<<<<< HEAD
      enum: ["admin", "user", "recruiter", "guest"],
=======
      enum: ["admin", "candidate", "recruiter"],
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);
