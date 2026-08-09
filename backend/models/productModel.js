const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A product must belong to a seller']
  },
  title: {
    type: String,
    required: [true, 'A product must have a title'],
    trim: true,
    maxlength: [100, 'A product title must have less or equal to 100 characters'],
    minlength: [5, 'A product title must have more or equal to 5 characters']
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
    min: [0, 'Price must be positive']
  },
  isNegotiable: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: [true, 'A product must have a category'],
    enum: {
      values: ['Books', 'Electronics', 'Furniture', 'Hostel Essentials', 'Cycles', 'Sports', 'Lab Equipment', 'Stationery'],
      message: '{VALUE} is not a supported category'
    }
  },
  condition: {
    type: String,
    required: [true, 'A product must have a condition'],
    enum: {
      values: ['New', 'Like New', 'Good', 'Fair'],
      message: '{VALUE} is not a supported condition'
    }
  },
  hostelNumber: {
    type: String,
    required: [true, 'A product must have a hostel number location']
  },
  college: {
    type: String,
    default: 'NIT Silchar'
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  images: [String], // Array of URLs (We will upload to Cloudinary later)
  status: {
    type: String,
    enum: ['Available', 'Sold', 'Hidden'],
    default: 'Available'
  },
  views: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes to vastly improve querying speed (e.g., when filtering by category or sorting by price)
productSchema.index({ price: 1, category: 1 });
// Text index for the search functionality
productSchema.index({ title: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
