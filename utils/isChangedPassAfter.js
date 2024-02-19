module.exports = function isChangedPasswordAfter(JWTTimestamp, user) {
  const miliseconds = 1000;
  const expiredTime = JWTTimestamp * miliseconds;

  if (user.passwordChangedAt) {
    const { passwordChangedAt } = user;
    if (passwordChangedAt >= expiredTime) return true;
  }

  return false;
};
