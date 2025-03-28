import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);