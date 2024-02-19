const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { ObjectId } = require('mongodb');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { client } = require('../config/db');
const isChangedPassAfter = require('../utils/isChangedPassAfter');

const usersCollection = client.db('magazyn').collection('Users');

module.exports = catchAsync(async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer')) {
    throw new AppError('You are not logged in! Please log in to get access!', 401);
  }

  const token = auth.split(' ')[1];

  if (!token) {
    throw new AppError('You are not logged in! Please log in to get access!', 401);
  }

  // Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  const userObjectId = new ObjectId(decoded.id);
  const user = await usersCollection.findOne(userObjectId);
  if (!user) {
    throw new AppError('The user no longer exist!', 401);
  }

  // check if user change password after token was issued

  if (isChangedPassAfter(decoded.exp, user)) {
    throw new AppError('User changed his password. Please log in again!', 401);
  }

  req.user = user;

  next();
});
