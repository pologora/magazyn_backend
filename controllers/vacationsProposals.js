const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');

const vacationsProposalsStatusTypes = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

const vacationsProposalsCollection = client.db('magazyn').collection('VacationsProposals');

exports.getAllVacationsProposal = catchAsync(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = 25;
  const {
    employeeId, start, end, type, thisYear, status,
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
    ...(status ? { status: { $eq: status } } : {}),
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
        description: 1,
        type: 1,
        created_at: 1,
        employeeId: 1,
        status: 1,
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

  const vacationsList = await vacationsProposalsCollection.aggregate(pipeline).toArray();
  const vacationsSize = vacationsList.length;

  res.status(200).json({
    status: 'success',
    vacationsSize,
    data: vacationsList,
  });
});

exports.createVacationProposal = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['employeeId', 'startVacation', 'endVacation', 'type', 'duration']);

  const {
    employeeId, startVacation, endVacation, type, duration, description,
  } = req.body;

  const status = vacationsProposalsStatusTypes.pending;
  const timeNow = new Date();

  const vacationProposal = await vacationsProposalsCollection.insertOne({
    employeeId: new ObjectId(employeeId),
    startVacation: new Date(startVacation),
    endVacation: new Date(endVacation),
    type,
    duration,
    status,
    created_at: timeNow,
    description,
  });

  res.status(201).json({
    status: 'success',
    data: vacationProposal,
  });
});

exports.getVacationProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };
  const options = { };

  const result = await vacationsProposalsCollection.findOne(query, options);

  checkResult(result, 'vacationProposal', 'get', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateVacationProposal = catchAsync(async (req, res, next) => {
  const {
    startVacation, endVacation, duration, type, status, description,
  } = req.body;

  const { id } = req.params;
  const vacationObjectId = new ObjectId(id);
  const query = { _id: vacationObjectId };

  const timeNow = new Date();

  const update = {
    $set: {
      status,
    },
  };

  if (startVacation) {
    update.$set.startVacation = new Date(startVacation);
  }
  if (endVacation) {
    update.$set.endVacation = new Date(endVacation);
  }
  if (duration) {
    update.$set.duration = duration;
  }
  if (type) {
    update.$set.type = type;
  }
  if (description) {
    update.$set.description = description;
  }

  update.$set.created_at = timeNow;

  const options = { returnDocument: 'after' };

  const result = await vacationsProposalsCollection.findOneAndUpdate(query, update, options);
  checkResult(result, 'vacationProposal', 'update', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.deleteVacationProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };

  const result = await vacationsProposalsCollection.findOneAndDelete(query);

  checkResult(result, 'user');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
