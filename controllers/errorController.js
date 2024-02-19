/* eslint-disable no-param-reassign */
const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    message: err.message,
    stack: err.stack,
    error: err.name,
  });
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const hadleJWTExpiredError = () => new AppError('Your token has expired! Please log in again!', 401);

const sendErrorProduction = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  if (err.isOperational) {
    res.status(statusCode).json({
      status,
      message: err.message,
    });
  } else {
    // eslint-disable-next-line no-console
    console.error('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    if (err.name === 'JsonWebTokenError') { err = handleJWTError(); }
    if (err.name === 'TokenExpiredError') { err = hadleJWTExpiredError(); }
    sendErrorProduction(err, res);
  }
};
