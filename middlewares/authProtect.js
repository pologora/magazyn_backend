const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = catchAsync(async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer')) {
    throw new AppError('You are not logged in! Please log in to get access!', 401);
  }
  const token = auth.split(' ')[1];

  if (!token) {
    throw new AppError('You are not logged in! Please log in to get access!', 401);
  }
  // varification token

  // check if user still exists

  // check if user change password after token was issued
  next();
});
