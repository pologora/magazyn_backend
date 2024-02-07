const catchAsync = require('../utils/catchAsync');
const { createUser } = require('./usersController');
const { client } = require('../config/db');
const validateRequiredFields = require('../utils/validateRequiredFields');
const compareSubmittedPassword = require('../utils/compareSubmittedPassword');
const AppError = require('../utils/appError');
const signToken = require('../utils/signToken');

const usersCollection = client.db('magazyn').collection('Users');

exports.signup = catchAsync(async (req, res, next) => {
  createUser(req, res, next);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password: submittedPassword } = req.body;
  validateRequiredFields(req.body, ['email', 'password']);

  const query = { email };
  const user = await usersCollection.findOne(query);

  if (!user) {
    throw new AppError('Wrong email or password', 401);
  }

  const storedPassword = user.password;

  const isValidPassword = await compareSubmittedPassword(submittedPassword, storedPassword);

  if (!isValidPassword) {
    throw new AppError('Wrong email or password', 401);
  }

  const { _id: id } = user;

  const token = signToken(id);

  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});
