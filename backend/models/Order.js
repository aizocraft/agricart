import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User reference is required'] 
  },
  orderItems: [
    {
      product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: [true, 'Product reference is required'] 
      },
      name: {
        type: String,
        required: [true, 'Product name is required']
      },
      image: {
        type: String,
        required: [true, 'Product image is required']
      },
      quantity: { 
        type: Number, 
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
      },
      price: { 
        type: Number, 
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
      },
      farmName: {
        type: String,
        required: [true, 'Farm name is required']
      },
      farmerPhone: {
        type: String,
        required: [true, 'Farmer phone is required'],
        validate: {
          validator: function(v) {
            return /^\d{10,15}$/.test(v);
          },
          message: props => `${props.value} is not a valid phone number!`
        }
      }
    }
  ],
  shippingAddress: {
    address: { 
      type: String, 
      required: [true, 'Address is required'],
      trim: true
    },
    city: { 
      type: String, 
      required: [true, 'City is required'],
      trim: true
    },
    postalCode: { 
      type: String, 
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: { 
      type: String, 
      required: [true, 'Country is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Shipping phone is required'],
      validate: {
        validator: function(v) {
          return /^\d{10,15}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    }
  },
  paymentMethod: { 
    type: String, 
    required: [true, 'Payment method is required'],
    enum: {
      values: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'],
      message: '{VALUE} is not a valid payment method'
    }
  },
  itemsPrice: { 
    type: Number, 
    required: true, 
    default: 0.0 
  },
  taxPrice: { 
    type: Number, 
    required: true, 
    default: 0.0 
  },
  shippingPrice: { 
    type: Number, 
    required: true, 
    default: 0.0 
  },
  totalPrice: { 
    type: Number, 
    required: true, 
    default: 0.0 
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
    phone: String
  },
  isPaid: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  paidAt: { 
    type: Date 
  },
  isDelivered: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  deliveredAt: { 
    type: Date 
  },
  status: {
    type: String,
    enum: {
      values: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Processing'
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for farmer details
orderSchema.virtual('farmerDetails', {
  ref: 'User',
  localField: 'orderItems.product',
  foreignField: '_id',
  justOne: false
});

// Pre-save hook to add farmer details to order items
orderSchema.pre('save', async function(next) {
  if (this.isModified('orderItems')) {
    await Promise.all(this.orderItems.map(async (item) => {
      const product = await mongoose.model('Product').findById(item.product)
        .populate('farmer', 'name phone farmName');
      
      if (product) {
        item.name = product.name;
        item.image = product.images[0];
        item.farmName = product.farmer.farmName;
        item.farmerPhone = product.farmer.phone;
      }
    }));
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;