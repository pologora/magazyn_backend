/* eslint-disable camelcase */
const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');
const Email = require('../utils/email');

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
        name: 1,
        surname: 1,
        status: 1,
      },
    },
    { $sort: { created_at: -1 } },
  ];

  if (!isRangeGiven && !thisYear) {
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });
  }

  const vacationsSize = await vacationsProposalsCollection.countDocuments();
  const vacationsList = await vacationsProposalsCollection.aggregate(pipeline).toArray();

  res.status(200).json({
    status: 'success',
    vacationsSize,
    data: vacationsList,
  });
});

exports.createVacationProposal = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, [
    'employeeId',
    'startVacation',
    'endVacation',
    'type',
    'duration',
    'name',
    'surname',
  ]);

  const {
    employeeId, startVacation, endVacation, type, duration, description, name, surname,
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
    name,
    surname,
  });

  const employeeCollection = client.db('magazyn').collection('Employee');
  const employee = await employeeCollection.findOne({ _id: new ObjectId(employeeId) });

  const emailUser = { email: employee.email, name, surname };
  const emailBodyText = `${startVacation.slice(0, 10)} - ${endVacation.slice(0, 10)}, 
  długość ${duration} dni, 
 ${type}`;

  new Email(emailUser, undefined, 'no-reply@snti.pl', emailBodyText).sendProposalCreation();

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
    startVacation, endVacation, duration, type, status, description, created_at,
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
  if (created_at) {
    update.$set.created_at = timeNow;
  }

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
