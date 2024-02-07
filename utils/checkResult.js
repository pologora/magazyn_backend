const AppError = require('./appError');

module.exports = (result, entityName, method, searchFilter) => {
  if (method === 'get') {
    if (!result) {
      throw new AppError(`No ${entityName} found with the provided ${searchFilter}`, 404);
    }
  } else if (!result.value) {
    throw new AppError(`No ${entityName} found with the provided ${searchFilter}`, 404);
  }
};

// probably needs to change for a 3 arguments function
