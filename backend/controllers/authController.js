const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

// Helper function to sign JWT tokens
const signTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });
  return { accessToken, refreshToken };
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // 1. Create the user (automatically setting isEmailVerified to true to bypass verification)
  const newUser = await User.create({
    name,
    email,
    password,
    isEmailVerified: true
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful! You can now log in.'
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  // 1. Get token from URL params and hash it
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2. Find user based on token AND check if token has not expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  // 3. If token invalid or expired
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 4. Update user to verified, clear tokens
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 5. Issue JWT tokens and log them in automatically
  const { accessToken, refreshToken } = signTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set HTTP-Only Cookie
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You are now logged in.',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError('Please provide an email', 400));

  const user = await User.findOne({ email });

  if (!user) {
    // We return success even if user not found to prevent email enumeration attacks
    return res.status(200).json({ success: true, message: 'If the email exists and is not verified, a new link has been sent.' });
  }

  if (user.isEmailVerified) {
    return next(new AppError('This email is already verified. Please log in.', 400));
  }

  // Generate new token
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;
  const message = `You requested a new verification link.\n\nPlease verify your email by clicking on this link: ${verifyURL}\nThis link is valid for 30 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify your CampusCart Account (Valid for 30 mins)',
      message
    });

    res.status(200).json({ success: true, message: 'A new verification link has been sent.' });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if user exists && password is correct
  // We use +password to explicitly select the field since it has select: false in schema
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. (Bypassed) Email verification check removed

  // 4. If everything ok, send tokens to client
  const { accessToken, refreshToken } = signTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set HTTP-Only Cookie
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });
  const refreshToken = cookies.jwt;

  // Verify the refresh token
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });

      const user = await User.findById(decoded.id);
      
      // Token reuse detection or invalid token
      if (!user || user.refreshToken !== refreshToken) {
        if (user) {
          // Token reuse detected. Clear the token in DB to force logout on all devices.
          user.refreshToken = undefined;
          await user.save({ validateBeforeSave: false });
        }
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = signTokens(user._id);

      // Save new refresh token in DB
      user.refreshToken = newRefreshToken;
      await user.save({ validateBeforeSave: false });

      // Set new cookie
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        accessToken: newAccessToken
      });
    }
  );
});

exports.logout = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204).json({ success: true }); // No content
  const refreshToken = cookies.jwt;

  // Find user by refresh token and clear it
  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

exports.syncUser = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, profileImageUrl } = req.body;
  const clerkUserId = req.auth.userId;

  if (!email) {
    return next(new AppError('Email is required for syncing user.', 400));
  }

  // 1. Enforce NITS Domain Restriction
  const domain = email.split('@')[1];
  if (domain !== 'nits.ac.in' && (!domain || !domain.endsWith('.nits.ac.in'))) {
    return next(new AppError('Only NITS students with an official NITS email address can use CampusCart.', 403));
  }

  // 2. Find or Create MongoDB User
  let user = await User.findOne({ clerkUserId });

  if (!user) {
    // Maybe user exists with this email but without clerkUserId (old JWT user migrating)
    user = await User.findOne({ email });
    if (user) {
      user.clerkUserId = clerkUserId;
      await user.save({ validateBeforeSave: false });
    } else {
      // Create entirely new user
      const name = [firstName, lastName].filter(Boolean).join(' ') || 'NITS Student';
      user = await User.create({
        name,
        email,
        clerkUserId,
        isEmailVerified: true
      });
    }
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
