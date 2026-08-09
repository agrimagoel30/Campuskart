const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.get('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// New Clerk Sync Route
router.post('/sync', authMiddleware.clerkProtect, authController.syncUser);

module.exports = router;
