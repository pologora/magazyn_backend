const { ObjectId, Double } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');
const AppError = require('../utils/appError');

const employeeCollection = client.db('magazyn').collection('Employee');

exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const query = {};
  const options = { };
  const employees = await employeeCollection.find(query, options).toArray();

  res.status(200).json({
    status: 'success',
    data: employees,
    headers: req.headers,
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
  } = req.body;

  const existingEmployee = await employeeCollection.findOne({ pin, _id: { $ne: userObjectId } });

  if (existingEmployee) {
    throw new AppError('Pin already in use');
  }

  const newData = { ...req.body };

  if (vacationDaysPerYear) {
    const newVacationDaysPerYear = vacationDaysPerYear
      ? new Double(Number(vacationDaysPerYear)) : null;
    newData.vacationDaysPerYear = newVacationDaysPerYear;
  }

  if (agency) {
    const agencyId = agency ? new ObjectId(agency) : null;
    newData.agency = agencyId;
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
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };

  const result = await employeeCollection.findOneAndDelete(query);

  checkResult(result, 'user');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
