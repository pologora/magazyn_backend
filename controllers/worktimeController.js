const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');

const workTimeCollection = client.db('magazyn').collection('Workdays');
const employeeCollection = client.db('magazyn').collection('Employee');

exports.getAllWorktime = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.query, ['id', 'startDate', 'endDate']);
  const { id, startDate, endDate } = req.query;
  const employeeId = new ObjectId(id);

  const employee = await employeeCollection.findOne({ _id: employeeId });
  checkResult(employee, 'employee', 'get', 'ID');

  let start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  let end = new Date();
  end.setHours(23, 59, 59, 999);

  if (startDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
  }

  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  const workdays = await workTimeCollection.find({
    employeeId,
    startWork: {
      $gte: new Date(start),
      $lte: new Date(end),
    },
  }).toArray();

  checkResult(workdays, 'workdays', 'get', 'id');

  res.status(200).json({
    status: 'success',
    data: workdays,
    headers: req.headers,
  });
});

exports.createWorkTime = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['id', 'startWork', 'endWork']);

  const { id, startWork, endWork } = req.body;

  const startWorkUtc = new Date(`${startWork}Z`);
  const endWorkUtc = new Date(`${endWork}Z`);

  const employeeId = new ObjectId(id);

  const newWorkTime = await workTimeCollection.insertOne({
    employeeId,
    startWork: startWorkUtc,
    endWork: endWorkUtc,
  });

  res.status(201).json({
    status: 'success',
    data: newWorkTime,
  });
});

exports.getWorkTime = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };
  const options = { };

  const result = await workTimeCollection.findOne(query, options);

  checkResult(result, 'worktime', 'get', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateWorkTime = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['startWork', 'endWork']);

  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };

  const workTimeDocument = await workTimeCollection.findOne(query);
  checkResult(workTimeDocument, 'worktime', 'get', 'ID');

  if (!workTimeCollection.endWork) {
    const employeeId = new ObjectId(workTimeDocument.employeeId);
    const result = await
    employeeCollection.findOneAndUpdate({ _id: employeeId }, { $set: { isWorking: false } });
    checkResult(result, 'employee', 'patch', 'ID');
  }

  const { startWork, endWork } = req.body;

  const startWorkUtc = new Date(`${startWork}Z`);
  const endWorkUtc = new Date(`${endWork}Z`);

  const newData = { startWork: startWorkUtc, endWork: endWorkUtc };

  const updateDocument = { $set: newData };
  const options = { returnDocument: 'after' };

  const result = await workTimeCollection.findOneAndUpdate(query, updateDocument, options);

  checkResult(result, 'user');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.deleteWorkTime = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };

  const result = await workTimeCollection.findOneAndDelete(query);

  checkResult(result, 'user');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
