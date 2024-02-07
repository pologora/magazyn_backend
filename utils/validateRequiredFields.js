const AppError = require('./appError');

module.exports = (obj, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !obj[field]);

  if (missingFields.length > 0) {
    const missingFieldsString = missingFields.join(', ');
    const message = `The following missing fields are required: ${missingFieldsString}.`;
    throw new AppError(message, 400);
  }
};
