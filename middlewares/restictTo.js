const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = (...role) => catchAsync(async (req, res, next) => {
  if (!role.includes(req.user.role)) {
    throw new AppError('User dont have permissions!', 401);
  }
  next();
});
