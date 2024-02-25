/* eslint-disable no-underscore-dangle */
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const catchAsync = require('../utils/catchAsync');
const { createUser } = require('./usersController');
const { client } = require('../config/db');
const validateRequiredFields = require('../utils/validateRequiredFields');
const compareSubmittedPassword = require('../utils/compareSubmittedPassword');
const AppError = require('../utils/appError');
const signToken = require('../utils/signToken');
const createPasswordResetToken = require('../utils/createPasswordResetToken');
const checkConfirmPassword = require('../utils/checkConfirmPassword');
const hashPassword = require('../utils/hashPassword');
const Email = require('../utils/email');

const usersCollection = client.db('magazyn').collection('Users');
const employeeCollection = client.db('magazyn').collection('Employee');

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

  const oneDay = 1000 * 60 * 60 * 24;

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * oneDay),
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  };

  // if (process.env.NODE_ENV === 'production') {
  //   cookieOptions.secure = true;
  // }

  res.cookie('jwt', token, cookieOptions);

  const signedUser = {
    name: user.name,
    surname: user.surname,
    employeeId: user.employeeId,
    email: user.email,
    id,
    role: user.role,
    isSnti: user.isSnti,
    vacationDaysPerYear: user.vacationDaysPerYear,
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
  const expiredTime = 1000 * 10 * 60;
  const {
    tokenExpires,
    hashedToken,
    resetToken,
  } = createPasswordResetToken(expiredTime);
  const update = { $set: { tokenExpires, hashedToken } };
  await usersCollection.findOneAndUpdate({ _id: user._id }, update);

  // 3) send email to user with a resetToken
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset/${resetToken}`;

    new Email(user, resetURL, 'no-replay@snti.pl').sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (error) {
    const updateUser = { $set: { tokenExpires: null, hashedToken: null } };
    await usersCollection.findOneAndUpdate({ _id: user._id }, updateUser);
    throw new AppError('Cant send an email. Please try again later', 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const now = new Date().getTime();
  const oneSecond = 1000;

  const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await usersCollection.findOne({
    hashedToken: passwordResetToken,
    tokenExpires: { $gte: now },
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
      hashedToken: null,
      tokenExpires: null,
      passwordChangedAt: now - oneSecond,
    },
  };

  await usersCollection.findOneAndUpdate(query, update);

  res.status(200).json({
    status: 'success',
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['currentPassword', 'password', 'confirmPassword']);
  const {
    currentPassword, password, confirmPassword,
  } = req.body;

  const isPassAndConfirmTheSame = checkConfirmPassword(password, confirmPassword);
  if (!isPassAndConfirmTheSame) {
    throw new AppError('Hasło i potwierdź hasło muszą być jednakowe', 400);
  }

  const validPassword = await compareSubmittedPassword(currentPassword, req.user.password);
  if (!validPassword) {
    throw new AppError('Nieprawidłowe hasło', 401);
  }

  const hashedPassword = await hashPassword(password);
  await usersCollection.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { password: hashedPassword } },
  );

  res.status(200).json({
    status: 'success',
    message: 'Password updated',
  });
});

exports.createNewUserRegistration = catchAsync(async (req, res, next) => {
  const {
    employeeId, email,
  } = req.body;
  validateRequiredFields(req.body, ['email', 'employeeId']);

  const employeeObjectId = new ObjectId(employeeId);
  const employee = await employeeCollection.findOne({ _id: employeeObjectId });

  const { name, surname } = employee;

  const milisec = 1000;
  const sec = 60;
  const hour = 60;
  const day = 24;
  const daysToExpire = 3;

  const expiredTime = milisec * sec * hour * day * daysToExpire;
  const {
    tokenExpires,
    hashedToken,
    resetToken: registrationToken,
  } = createPasswordResetToken(expiredTime);

  const user = {
    name,
    email,
    surname,
    tokenExpires,
    token: hashedToken,
    employeeId: employeeObjectId,
    role: 'user',
    isSnti: employee.isSnti,
    vacationDaysPerYear: employee.vacationDaysPerYear,
  };

  await usersCollection.insertOne(user);

  // 3) send email to user with a registration token
  try {
    // const registrationLink = `${req.protocol}://${req.get('host')}/signup/${resetToken}`;
    const registrationLink = `http://localhost:5173/signup/${registrationToken}`;

    new Email(user, registrationLink, 'no-reply@snti.pl').sendRejestration();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (error) {
    await usersCollection.findOneAndDelete({ employeeId: employeeObjectId });
    throw new AppError('Cant send an email. Please try again later', 500);
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.registerMe = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const now = new Date().getTime();
  const oneSecond = 1000;

  const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await usersCollection.findOne({
    token: passwordResetToken,
    tokenExpires: { $gte: now },
  });

  if (!user) {
    throw new AppError('Miną chas na rejestrację!', 400);
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
      token: null,
      tokenExpires: null,
      passwordChangedAt: now - oneSecond,
      registered: true,
    },
  };

  const employeeObjectId = new ObjectId(user.employeeId);
  await employeeCollection.findOneAndUpdate(
    { _id: employeeObjectId },
    { $set: { userId: user._id } },
  );

  await usersCollection.findOneAndUpdate(query, update);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
