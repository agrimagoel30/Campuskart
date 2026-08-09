const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes (No login required)
router
  .route('/')
  .get(productController.getAllProducts);

router
  .route('/:id')
  .get(productController.getProduct);

// Protected routes (Must be logged in)
// We can apply the middleware to all routes below this point
router.use(authMiddleware.protect);

router
  .route('/')
  .post(uploadMiddleware.uploadProductImages, productController.createProduct);

router
  .route('/:id/sold')
  .patch(productController.markAsSold);

router
  .route('/:id')
  .patch(uploadMiddleware.uploadProductImages, productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
