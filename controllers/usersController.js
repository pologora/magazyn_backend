const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');
const checkConfirmPassword = require('../utils/checkConfirmPassword');
const AppError = require('../utils/appError');
const hashPassword = require('../utils/hashPassword');

const usersCollection = client.db('magazyn').collection('Users');
const employeeCollection = client.db('magazyn').collection('Employee');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let query = {};

  if (req.query.employeeId) {
    const employeeId = new ObjectId(req.query.employeeId);
    query = { employeeId };
  }

  const options = {
    projection: {
      password: 0,
      passwordResetExpires: 0,
      passwordResetToken: 0,
      passwordChangedAt: 0,
    },
  };
  const users = await usersCollection.find(query, options).toArray();

  res.status(200).json({
    status: 'success',
    data: users,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const {
    name, email, password, confirmPassword, employeeId, surname,
  } = req.body;

  const role = 'user';

  if (!checkConfirmPassword(password, confirmPassword)) {
    throw new AppError('Passwords are not the same!', 400);
  }

  validateRequiredFields(req.body, ['name', 'surname', 'password', 'employeeId', 'email', 'confirmPassword']);

  const hashedPassword = await hashPassword(password);

  const employeeObjectId = new ObjectId(employeeId);
  const employee = await employeeCollection.findOne({ _id: employeeObjectId });

  const user = {
    name,
    email,
    surname,
    password: hashedPassword,
    employeeId: employeeObjectId,
    role,
    isSnti: employee.isSnti,
  };

  const result = await usersCollection.insertOne(user);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };
  const options = { projection: { password: 0 } };

  const result = await usersCollection.findOne(query, options);

  checkResult(result, 'user', 'get', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const newData = req.body;

  const query = { _id: userObjectId };
  const updateDocument = { $set: newData };
  const options = { returnDocument: 'after' };

  const result = await usersCollection.findOneAndUpdate(query, updateDocument, options);

  checkResult(result, 'user');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };

  const result = await usersCollection.findOneAndDelete(query);

  checkResult(result, 'user');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
