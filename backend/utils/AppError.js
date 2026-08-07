class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // 4xx status codes mean fail (client error), 5xx mean error (server error)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // isOperational is used to identify trusted errors vs programming bugs
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
