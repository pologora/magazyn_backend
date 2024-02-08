const { ObjectId } = require('mongodb');
const { client } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const checkResult = require('../utils/checkResult');
const validateRequiredFields = require('../utils/validateRequiredFields');

const adminSettingsCollection = client.db('magazyn').collection('AdminSettings');

exports.getAdminSettings = catchAsync(async (req, res, next) => {
  validateRequiredFields(req.params, ['id']);

  const { id } = req.params;
  const userObjectId = new ObjectId(id);
  const query = { _id: userObjectId };

  const result = await adminSettingsCollection.findOne(query);

  checkResult(result, 'adminSettings', 'get', 'ID');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.updateAdminSettings = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const settingsId = new ObjectId(id);

  const update = { $set: { ...req.body } };
  const options = { returnDocument: 'after' };

  const result = await
  adminSettingsCollection.findOneAndUpdate({ _id: settingsId }, update, options);

  checkResult(result, 'user');

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
