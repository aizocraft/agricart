import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: { 
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
    set: v => parseFloat(v.toFixed(2)) // Ensure 2 decimal places
  },
  unit: {
    type: String,
    required: true,
    enum: {
      values: ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'packet'],
      message: '{VALUE} is not a valid unit'
    },
    default: 'kg'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Fruits', 'Vegetables', 'Dairy', 'Grains', 
        'Meat', 'Poultry', 'Seafood', 'Herbs', 'Spices', 'Other'
      ],
      message: '{VALUE} is not a valid category'
    }
  },
  subCategory: {
    type: String,
    required: [
      function() {
        return ['Fruits', 'Vegetables', 'Dairy'].includes(this.category);
      },
      'Subcategory is required for this category'
    ]
  },
  images: {
    type: [String],
    required: [true, 'At least one product image is required'],
    validate: {
      validator: v => Array.isArray(v) && v.length > 0,
      message: 'At least one product image is required'
    }
  },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Farmer reference is required'] 
  },
  stock: { 
    type: Number, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  harvestDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v <= new Date();
      },
      message: 'Harvest date cannot be in the future'
    }
  },
  organic: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Set location from farmer before saving
productSchema.pre('save', async function(next) {
  if (!this.isModified('location') || !this.location) {
    const farmer = await mongoose.model('User').findById(this.farmer);
    if (farmer) {
      this.location = farmer.location;
    }
  }
  next();
});

// Add virtual population
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

export default mongoose.model('Product', productSchema);