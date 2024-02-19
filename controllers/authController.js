/* eslint-disable no-underscore-dangle */
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const { createUser } = require('./usersController');
const { client } = require('../config/db');
const validateRequiredFields = require('../utils/validateRequiredFields');
const compareSubmittedPassword = require('../utils/compareSubmittedPassword');
const AppError = require('../utils/appError');
const signToken = require('../utils/signToken');
const createPasswordResetToken = require('../utils/createPasswordResetToken');
const sendEmail = require('../utils/email');
const checkConfirmPassword = require('../utils/checkConfirmPassword');
const hashPassword = require('../utils/hashPassword');

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

  const signedUser = {
    name: user.name,
    surname: user.surname,
    employeeId: user.employeeId,
    email: user.email,
    token,
    id,
    role: user.role,
    isSnti: user.isSnti,
  };

  res.status(200).json({
    status: 'success',
    data: signedUser,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['email']);
  // 1) get user by email
  const user = await usersCollection.findOne({ email: req.body.email });
  if (!user) {
    throw new AppError('No user with email address', 404);
  }

  // 2) generate the random token and update user
  const { passwordResetExpires, passwordResetToken, resetToken } = createPasswordResetToken();
  const update = { $set: { passwordResetExpires, passwordResetToken } };
  await usersCollection.findOneAndUpdate({ _id: user._id }, update);

  // 3) send email to user with a resetToken

  try {
    const resetURL = `http://localhost:3000/api/v1/users/reset/${resetToken}`;

    const mailOptions = {
      email: user.email,
      subject: 'Reset password (valid for 10 minutes)',
      message: `Reset password link: ${resetURL}`,
    };

    await sendEmail(mailOptions);

    res.status(200).json({
      status: 'success',
    });
  } catch (error) {
    const updateUser = { $set: { passwordResetExpires: null, passwordResetToken: null } };
    await usersCollection.findOneAndUpdate({ _id: user._id }, updateUser);
    throw new AppError('Cant send an email. Please try again later', 500);
  }

  res.status(200).json({
    status: 'success',
    message: 'Token send to email!',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const now = new Date().getTime();
  const oneSecond = 1000;

  const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await usersCollection.findOne({
    passwordResetToken,
    passwordResetExpires: { $gte: now },
  });

  if (!user) {
    throw new AppError('Miną chas na zmianę hasła!', 400);
  }

  const { password, confirmPassword } = req.body;
  const passIsValid = checkConfirmPassword(password, confirmPassword);

  if (!passIsValid) {
    throw new AppError('Hasło i potwierdź hasło muszą być jednakowe', 400);
  }

  const hashedPassword = await hashPassword(password);
  const query = { _id: user._id };
  const update = {
    $set: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: now - oneSecond,
    },
  };

  await usersCollection.findOneAndUpdate(query, update);

  res.status(200).json({
    status: 'success',
  });
});
