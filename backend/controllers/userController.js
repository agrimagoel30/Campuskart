const User = require('../models/userModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const cloudinary = require('../utils/cloudinary');

// @desc    Get current user profile & stats
// @route   GET /api/v1/users/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ clerkUserId: req.auth.userId }).populate('wishlist');

  if (!user) {
    return next(new AppError('User not found in database.', 404));
  }

  // Count user's listings
  const listingsCount = await Product.countDocuments({ sellerId: user._id });
  const soldCount = await Product.countDocuments({ sellerId: user._id, status: 'Sold' });

  res.status(200).json({
    status: 'success',
    data: {
      user,
      stats: {
        listings: listingsCount,
        sold: soldCount,
        wishlist: user.wishlist.length
      }
    }
  });
});

// @desc    Update current user profile
// @route   PATCH /api/v1/users/me
// @access  Private
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  // 2) Find the user
  const user = await User.findOne({ clerkUserId: req.auth.userId });
  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  // 3) Filter out unwanted fields that are not allowed to be updated here
  const filteredBody = {};
  if (req.body.name) filteredBody.name = req.body.name;
  if (req.body.bio !== undefined) filteredBody.bio = req.body.bio; // allow empty bio

  // 4) Check if user uploaded a new profile photo
  if (req.file) {
    // If user already has a profile photo from cloudinary, delete old one
    if (user.profilePhoto && user.profilePhoto.includes('cloudinary.com')) {
      try {
        // Extract public ID from cloudinary URL
        const urlParts = user.profilePhoto.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `CampusCart/Profiles/${fileName.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting old profile photo from Cloudinary:', err);
      }
    }
    filteredBody.profilePhoto = req.file.path;
  }

  // 5) Update user document
  const updatedUser = await User.findByIdAndUpdate(user._id, filteredBody, {
    new: true,
    runValidators: true
  }).populate('wishlist');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// @desc    Add product to wishlist
// @route   POST /api/v1/users/wishlist/:productId
// @access  Private
exports.addToWishlist = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }
  
  if (product.status === 'Sold') {
    return next(new AppError('Cannot wishlist a sold product.', 400));
  }

  const currentUser = await User.findOne({ clerkUserId: req.auth.userId });
  if (product.sellerId.toString() === currentUser._id.toString()) {
     return next(new AppError('You cannot wishlist your own product.', 400));
  }

  const user = await User.findOneAndUpdate(
    { clerkUserId: req.auth.userId },
    { $addToSet: { wishlist: req.params.productId } }, // $addToSet prevents duplicates
    { new: true }
  ).populate('wishlist');

  res.status(200).json({
    status: 'success',
    message: 'Product added to wishlist',
    data: {
      user
    }
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/users/wishlist/:productId
// @access  Private
exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { clerkUserId: req.auth.userId },
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  ).populate('wishlist');

  res.status(200).json({
    status: 'success',
    message: 'Product removed from wishlist',
    data: {
      user
    }
  });
});
