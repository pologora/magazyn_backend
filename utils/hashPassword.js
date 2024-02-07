const bcrypt = require('bcrypt');

const saltRounds = 12;

module.exports = async (password) => bcrypt.hash(password, saltRounds);
