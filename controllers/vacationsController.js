const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');

const vacationsCollection = client.db('magazyn').collection('Vacations');

exports.getAllVacations = catchAsync(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = 25;
  const {
    employeeId, start, end, type, thisYear,
  } = req.query;

  const isRangeGiven = Boolean(start && end);

  let startDate;
  let endDate;

  if (isRangeGiven) {
    startDate = new Date(start);
    endDate = new Date(end);
  } else {
    const currentYear = new Date().getFullYear();
    const startOfYear = `${new Date(currentYear, 0, 1)}Z`;
    const endOfYear = `${new Date(currentYear, 11, 31)}Z`;

    startDate = new Date(startOfYear);
    endDate = new Date(endOfYear);

    endDate.setUTCHours(23, 59, 59, 999);
  }

  const matchStage = {
    ...(employeeId ? { employeeId: { $eq: new ObjectId(employeeId) } } : {}),
    ...(type ? { type: { $eq: type } } : {}),
    ...((start && end) || thisYear ? {
      startVacation: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    } : {}),
  };
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'Employee',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employeeData',
      },
    },
    {
      $project: {
        _id: 1,
        startVacation: '$startVacation',
        endVacation: '$endVacation',
        duration: 1,
        type: 1,
        created_at: 1,
        employeeId: 1,
        name: { $arrayElemAt: ['$employeeData.name', 0] },
        surname: { $arrayElemAt: ['$employeeData.surname', 0] },
      },
    },
    { $sort: { created_at: -1 } },
  ];

  if (!isRangeGiven && !thisYear) {
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
  }

  const vacationsList = await vacationsCollection.aggregate(pipeline).toArray();
  const vacationsSize = vacationsList.length;

  res.status(200).json({
    status: 'success',
    vacationsSize,
    data: vacationsList,
  });
});

exports.createVacation = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['employeeId', 'startVacation', 'endVacation', 'type', 'duration']);

  const {
    employeeId, startVacation, endVacation, type, duration,
  } = req.body;

  const timeNow = new Date();

  const startVacationUtc = new Date(`${startVacation}`);
  const endVacationUtc = new Date(`${endVacation}`);

  const employeeObjectId = new ObjectId(employeeId);

  const newVacation = await vacationsCollection.insertOne({
    employeeId: employeeObjectId,
    startVacation: startVacationUtc,
    endVacation: endVacationUtc,
    duration,
    type,
    created_at: timeNow,
  });

  res.status(201).json({
    status: 'success',
    data: newVacation,
  });
});

exports.getVacation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };
  const options = { };

  const result = await vacationsCollection.findOne(query, options);

  checkResult(result, 'vacation', 'get', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateVacation = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['startVacation', 'endVacation', 'duration', 'type', 'employeeId']);
  const {
    startVacation, endVacation, duration, type, employeeId,
  } = req.body;

  const { id } = req.params;
  const vacationObjectId = new ObjectId(id);
  const query = { _id: vacationObjectId };

  const employeeObjectId = new ObjectId(employeeId);

  const timeNow = new Date();

  const update = {
    $set: {
      startVacation: new Date(startVacation),
      endVacation: new Date(endVacation),
      duration,
      type,
      employeeId: employeeObjectId,
      created_at: timeNow,
    },
  };

  const options = { returnDocument: 'after' };

  const result = await vacationsCollection.findOneAndUpdate(query, update, options);
  checkResult(result, 'vacation', 'update', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.deleteVacation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };

  const result = await vacationsCollection.findOneAndDelete(query);

  checkResult(result, 'vacation');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
