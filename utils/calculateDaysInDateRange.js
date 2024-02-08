exports.calculateDaysRange = (start, end) => {
  const millisecondsRange = new Date(end).getTime() - new Date(start).getTime();
  return millisecondsRange / (1000 * 60 * 60 * 24);
};
