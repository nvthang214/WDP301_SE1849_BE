
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['admin', 'user', 'recruiter', 'guest'] },
});

module.exports = mongoose.model('Role', RoleSchema);
