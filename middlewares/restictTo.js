const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = (role) => catchAsync(async (req, res, next) => {
  if (req.user.role !== role) {
    console.log('halo');
    throw new AppError('User dont have permissions!', 401);
  }
  console.log(req.user.role, role);
  next();
});
