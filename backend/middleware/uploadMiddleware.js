const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const AppError = require('../utils/AppError');

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'CampusCart/Products', // The folder in your Cloudinary dashboard
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optimize image size before saving
  }
});

// Multer Filter to ensure only images are uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// Export a middleware that allows uploading up to 3 images under the field name 'images'
exports.uploadProductImages = upload.array('images', 3);

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'CampusCart/Profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit per file for profiles
  }
});

exports.uploadProfileImage = uploadProfile.single('profilePhoto');
