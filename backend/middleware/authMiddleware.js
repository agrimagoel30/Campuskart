const { getAuth } = require('@clerk/express');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// 1) Clerk Middleware to protect routes (verifies session token)
exports.clerkProtect = (req, res, next) => {
  console.log('--- clerkProtect Middleware ---');
  console.log('Authorization Header:', req.headers.authorization);
  
  // getAuth(req) invokes the req.auth() function internally and returns the state
  const authState = getAuth(req);
  console.log('authState:', JSON.stringify(authState));

  if (!authState || !authState.userId) {
    return next(new AppError('Unauthorized - No valid Clerk session found.', 401));
  }
  
  // Overwrite req.auth with the object so downstream controllers (like attachDbUser) don't break
  req.auth = authState;
  next();
};

// 2) Custom Middleware to map Clerk user to MongoDB user
exports.attachDbUser = catchAsync(async (req, res, next) => {
  // req.auth is provided by requireAuth()
  if (!req.auth || !req.auth.userId) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Check if user exists in DB mapping to this clerkUserId
  const currentUser = await User.findOne({ clerkUserId: req.auth.userId });
  
  if (!currentUser) {
    return next(new AppError('User profile not found. Please sign in again to sync your profile.', 401));
  }

  // Put the MongoDB user object onto the request so future controllers can access it (e.g. req.user._id)
  req.user = currentUser;
  next();
});

// Composite protect middleware
exports.protect = [exports.clerkProtect, exports.attachDbUser];

// Middleware to restrict routes to certain roles (e.g. admin only)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
