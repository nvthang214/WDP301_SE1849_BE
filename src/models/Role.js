import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["admin", "user", "recruiter", "guest"],
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
