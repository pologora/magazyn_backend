const bcrypt = require('bcrypt');

// eslint-disable-next-line max-len
module.exports = async (submittedPassword, storedPassword) => bcrypt.compare(submittedPassword, storedPassword);
