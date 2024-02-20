const crypto = require('crypto');

module.exports = function createToken(addedTimeInMs) {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const tokenExpires = new Date().getTime() + addedTimeInMs;

  return { resetToken, hashedToken, tokenExpires };
};
