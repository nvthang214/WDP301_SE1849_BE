
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
<<<<<<< HEAD
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 255 }
});
=======
  name: { 
    type: String, 
    required: true, 
    maxlength: 100 
  },
  description: { type: String, maxlength: 255 }
},
{ timestamps: true }
);
>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d

export default mongoose.model('Category', CategorySchema);
