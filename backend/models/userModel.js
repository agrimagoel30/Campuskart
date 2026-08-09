const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true,
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  wishlist: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (el) {
        const domain = el.split('@')[1];
        return domain === 'nits.ac.in' || (domain && domain.endsWith('.nits.ac.in'));
      },
      message: 'Please use your official NITS email address (e.g. student@ei.nits.ac.in).'
    }
  },
  password: {
    type: String,
    minlength: 8,
    select: false, // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  refreshToken: String, // Store refresh token for rotation/invalidation
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare given password with database hash
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Generate random verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and set it to the schema (this is what gets saved to DB)
  // Hashing it adds security in case the DB is compromised
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expiration to 30 minutes from now
  this.emailVerificationExpires = Date.now() + 30 * 60 * 1000;

  // We return the plain, unhashed token to send via email
  return verificationToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
