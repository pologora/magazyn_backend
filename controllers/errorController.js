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
    sendErrorProduction(err, res);
  }
};
