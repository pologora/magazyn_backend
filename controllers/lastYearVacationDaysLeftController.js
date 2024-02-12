const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');

const lastYearLeftDaysCollection = client.db('magazyn').collection('LastYearLeftDays');

exports.getAllLastYearDays = catchAsync(async (req, res, next) => {
  const result = await lastYearLeftDaysCollection.find({}).toArray();
  checkResult(result, 'getAllLastYear', 'get');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateCreateLastYearDays = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['employeeId', 'daysLeft']);
  const { employeeId, daysLeft } = req.body;
  const employeeObjectId = new ObjectId(employeeId);

  const query = { employeeId: employeeObjectId };
  const update = { $set: { daysLeft } };
  const options = { upsert: true, returnDocument: 'after' };

  const result = await lastYearLeftDaysCollection.findOneAndUpdate(query, update, options);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
