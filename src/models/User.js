
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  Email: { type: String, required: true, maxlength: 108 },
  Password: { type: String, required: true, maxlength: 50 },
  Role: { type: String, required: true, maxlength: 20 },
  phone_number: { type: String },
  IsActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  FullName: { type: String, required: true, maxlength: 100 }
});

export default mongoose.model('User', UserSchema);
