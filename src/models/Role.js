import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['admin', 'user', 'recruiter', 'guest'] },
});

const Role = mongoose.model('Role', RoleSchema);
export default Role;