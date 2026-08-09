const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const cloudinary = require('../utils/cloudinary');

// Helper to extract Cloudinary public_id from URL
const getCloudinaryPublicId = (url) => {
  // Extract folder and filename, e.g., 'CampusCart/Products/abc12345'
  const match = url.match(/\/v\d+\/(.+)\.[a-zA-Z]+$/);
  return match ? match[1] : null;
};

// @desc    Get all products (with advanced querying)
// @route   GET /api/v1/products
// @access  Public
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  // Pass the base query (Product.find()) and the query string from the URL
  const features = new APIFeatures(Product.find({ status: { $ne: 'Hidden' } }), req.query)
    .search()
    .filter()
    .sort()
    .paginate();
    
  const products = await features.query;

  // We can also count total documents for the frontend pagination component
  // Note: Counting after filtering requires a separate query or cloning the query. 
  // For simplicity in this milestone, we'll just return the results.

  // SEND RESPONSE
  res.status(200).json({
    success: true,
    results: products.length,
    data: {
      products
    }
  });
});

// @desc    Mark a product as sold
// @route   PATCH /api/v1/products/:id/sold
// @access  Private (Owner only)
exports.markAsSold = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Security Check: Only the seller who created the product can mark it as sold
  if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to mark this product as sold', 403));
  }

  // Perform the update
  product.status = 'Sold';
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      product
    }
  });
});

// @desc    Get single product details
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = catchAsync(async (req, res, next) => {
  // We use populate to get the seller's name and email instead of just the ObjectId
  const product = await Product.findById(req.params.id).populate('sellerId', 'name email role');

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Increment view count
  product.views += 1;
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      product
    }
  });
});

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private (Logged in users only)
exports.createProduct = catchAsync(async (req, res, next) => {
  // Important: We assign the sellerId based on the logged-in user
  req.body.sellerId = req.user.id;

  // Extract Cloudinary URLs from multer-storage-cloudinary req.files array
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((file) => file.path);
  }

  const newProduct = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      product: newProduct
    }
  });
});

// @desc    Update a product
// @route   PATCH /api/v1/products/:id
// @access  Private (Owner only)
exports.updateProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Security Check: Only the seller who created the product can update it
  if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to edit this product', 403));
  }

  // Extract Cloudinary URLs from multer-storage-cloudinary req.files array
  if (req.files && req.files.length > 0) {
    // If there are new images, delete the old ones from Cloudinary first
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(imgUrl => {
        const publicId = getCloudinaryPublicId(imgUrl);
        if (publicId) {
          return cloudinary.uploader.destroy(publicId).catch(err => {
            console.error(`Failed to delete old image ${publicId} from Cloudinary:`, err);
          });
        }
        return Promise.resolve();
      });
      await Promise.allSettled(deletePromises);
    }

    req.body.images = req.files.map((file) => file.path);
  }

  // Perform the update
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the updated document
    runValidators: true // Ensure new data meets schema requirements
  });

  res.status(200).json({
    success: true,
    data: {
      product
    }
  });
});

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private (Owner or Admin only)
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Security Check: Only the seller or an admin can delete
  if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this product', 403));
  }

  // Delete images from Cloudinary before deleting the product
  if (product.images && product.images.length > 0) {
    const deletePromises = product.images.map(imgUrl => {
      const publicId = getCloudinaryPublicId(imgUrl);
      if (publicId) {
        return cloudinary.uploader.destroy(publicId).catch(err => {
          console.error(`Failed to delete image ${publicId} from Cloudinary:`, err);
        });
      }
      return Promise.resolve();
    });
    // Use allSettled so if one fails, it doesn't block product deletion
    await Promise.allSettled(deletePromises);
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(204).json({
    success: true,
    data: null
  });
});
