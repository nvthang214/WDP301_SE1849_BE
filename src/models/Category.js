import mongoose from 'mongoose';
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 255 }
});

export default mongoose.model('Category', CategorySchema);
