
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 255 }
});

module.exports = mongoose.model('Category', CategorySchema);
