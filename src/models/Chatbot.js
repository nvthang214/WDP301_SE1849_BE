
import mongoose from 'mongoose';

const ChatbotSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  response: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Chatbot', ChatbotSchema);
