const crypto = require('crypto');

module.exports = function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const passwordResetExpires = new Date().getTime() + 10 * 60 * 1000;

  return { resetToken, passwordResetToken, passwordResetExpires };
};
