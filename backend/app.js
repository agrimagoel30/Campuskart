const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { clerkMiddleware } = require('@clerk/express');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorMiddleware');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174', // Your frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cookie parser, reading cookies into req.cookies
app.use(cookieParser());

// Clerk Middleware
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
}));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Route modules
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const chatRouter = require('./routes/chatRoutes');
const userRouter = require('./routes/userRoutes');

// Base route for health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusCart Backend is running successfully'
  });
});

// Mount Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/chats', chatRouter);

// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
