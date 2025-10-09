
import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['admin', 'user', 'recruiter', 'guest'] },
});

export default mongoose.model('Role', RoleSchema);
