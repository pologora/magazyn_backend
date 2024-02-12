const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');

const agenciesCollection = client.db('magazyn').collection('Agencies');

exports.getAllAgencies = catchAsync(async (req, res, next) => {
  const query = {};
  const options = { };
  const result = await agenciesCollection.find(query, options).toArray();

  res.status(200).json({
    status: 'success',
    data: result,
    headers: req.headers,
  });
});

exports.createAgency = catchAsync(async (req, res, next) => {
  const {
    contactPerson, email, name, phone,
  } = req.body;

  const user = await agenciesCollection.insertOne({
    name,
    email,
    phone,
    contactPerson,
  });

  res.status(201).json({
    status: 'success',
    data: user,
  });
});

exports.getAgency = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };

  const result = await agenciesCollection.findOne(query);

  checkResult(result, 'agency', 'get', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateAgency = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const agencyObjectId = new ObjectId(id);
  const newData = req.body;

  const query = { _id: agencyObjectId };
  const updateDocument = { $set: newData };
  const options = { returnDocument: 'after' };

  const result = await agenciesCollection.findOneAndUpdate(query, updateDocument, options);

  checkResult(result, 'agency');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.deleteAgency = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const agencyObjectId = new ObjectId(id);
  const query = { _id: agencyObjectId };

  const result = await agenciesCollection.findOneAndDelete(query);

  checkResult(result, 'agency');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
