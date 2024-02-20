module.exports = function filterAllowedFields(data, ...fields) {
  const result = {};

  fields.forEach((element) => {
    if (Object.prototype.hasOwnProperty.call(data, element)) { result[element] = data[element]; }
  });

  return result;
};
