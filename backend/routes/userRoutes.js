const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware.clerkProtect);

// Profile routes
router
  .route('/me')
  .get(userController.getMe)
  .patch(uploadMiddleware.uploadProfileImage, userController.updateMe);

// Wishlist routes
router
  .route('/wishlist/:productId')
  .post(userController.addToWishlist)
  .delete(userController.removeFromWishlist);

module.exports = router;
