import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Fruits', 
      'Vegetables', 
      'Dairy', 
      'Grains', 
      'Meat', 
      'Poultry',
      'Seafood',
      'Herbs',
      'Spices',
      'Other'
    ]
  },
  subCategory: {
    type: String,
    required: function() {
      return this.category === 'Fruits' || 
             this.category === 'Vegetables' ||
             this.category === 'Dairy';
    }
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  stock: { 
    type: Number, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  location: {
    type: String,
    required: true
  },
  harvestDate: {
    type: Date
  },
  organic: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// Automatically populate farmer details when querying
productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'farmer',
    select: 'name avatar location farmName rating'
  });
  next();
});

// Set location from farmer's location before saving
productSchema.pre('save', async function(next) {
  if (!this.isModified('location')) {
    const farmer = await mongoose.model('User').findById(this.farmer);
    this.location = farmer.location;
  }
  next();
});

export default mongoose.model('Product', productSchema);