
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  description: { type: String },
  address: { type: String },
  industry: { type: String }
});

module.exports = mongoose.model('Company', CompanySchema);
