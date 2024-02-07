exports.checkID = (req, res, next, val) => {
  if (Number(val) > 10) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  return next();
};
