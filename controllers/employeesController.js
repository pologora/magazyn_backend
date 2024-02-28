const { ObjectId, Double } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');
const AppError = require('../utils/appError');
const filterAllowedFields = require('../utils/filterAllowedFields');

const employeeCollection = client.db('magazyn').collection('Employee');

exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const { isWorking, isSnti } = req.query;
  let employees;

  if (isWorking) {
    const queryObj = { isWorking: true };
    employees = await employeeCollection
      .aggregate([
        {
          $match: queryObj,
        },
        {
          $lookup: {
            from: 'Workdays',
            localField: '_id',
            foreignField: 'employeeId',
            as: 'workdays',
          },
        },
        {
          $unwind: '$workdays',
        },
        {
          $match: { 'workdays.endWork': null },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            surname: { $first: '$surname' },
            startWork: { $max: '$workdays.startWork' },
          },
        },
        {
          $sort: { startWork: 1 },
        },
      ])
      .toArray();
  } else if (isSnti) {
    const queryObj = { isSnti: true };
    employees = await employeeCollection.find(queryObj).toArray();
  } else {
    employees = await employeeCollection.find({}).toArray();
  }

  res.status(200).json({
    status: 'success',
    data: employees,
  });
});

exports.createEmployee = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.body, ['name', 'surname', 'pin']);
  const {
    name, surname, pin, agency, email, isSnti = false, vacationDaysPerYear,
  } = req.body;

  const isWorking = false;

  const vacationDaysPerYearDouble = vacationDaysPerYear
    ? new Double(Number(vacationDaysPerYear)) : new Double(0);

  const agencyObjectId = agency ? new ObjectId(agency) : null;

  const isEmployeeWithPin = await employeeCollection.findOne({ pin });

  if (isEmployeeWithPin) {
    throw new AppError('Pin already exist');
  }

  const employee = await employeeCollection.insertOne({
    name,
    email,
    surname,
    isSnti,
    isWorking,
    pin,
    vacationDaysPerYear: vacationDaysPerYearDouble,
    agency: agencyObjectId,
  });

  res.status(201).json({
    status: 'success',
    data: employee,
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };
  const options = { };

  const result = await employeeCollection.findOne(query, options);

  checkResult(result, 'employee', 'get', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);

  const {
    pin,
    vacationDaysPerYear,
    agency,
    isSnti,
  } = req.body;

  const existingEmployee = await employeeCollection.findOne({ pin, _id: { $ne: userObjectId } });

  if (existingEmployee) {
    throw new AppError('Pin already in use');
  }
  const newData = filterAllowedFields(
    req.body,
    'email',
    'name',
    'surname',
    'pin',
    'agency',
    'vacationDaysPerYear',
    'isSnti',
    'isWorking',
    'userId',
  );

  if (vacationDaysPerYear) {
    const newVacationDaysPerYear = vacationDaysPerYear
      ? new Double(Number(vacationDaysPerYear)) : null;
    newData.vacationDaysPerYear = newVacationDaysPerYear;
  }

  if (agency) {
    const agencyId = agency ? new ObjectId(agency) : null;
    newData.agency = agencyId;
  }

  if (isSnti) {
    newData.agency = null;
  }

  const query = { _id: userObjectId };
  const updateDocument = { $set: newData };
  const options = { returnDocument: 'after' };

  const result = await employeeCollection.findOneAndUpdate(query, updateDocument, options);

  checkResult(result, 'user');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const employeeObjectId = new ObjectId(id);
  const query = { _id: employeeObjectId };
  const filterEmployee = { employeeId: employeeObjectId };

  const workdaysCollection = client.db('magazyn').collection('Workdays');
  const vacationCollection = client.db('magazyn').collection('Vacations');
  const usersCollection = client.db('magazyn').collection('Users');

  await employeeCollection.findOneAndDelete(query);
  await workdaysCollection.deleteMany(filterEmployee);
  await vacationCollection.deleteMany(filterEmployee);
  await usersCollection.findOneAndDelete(filterEmployee);

  res.status(200).json({
    status: 'success',
  });
});
