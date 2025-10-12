import mongoose from 'mongoose';
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  description: { type: String },
  address: { type: String },
  industry: { type: String }
});

export default mongoose.model('Company', CompanySchema);
