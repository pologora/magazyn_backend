// const origin = process.env.NODE_ENV === 'development' ? process.env.CORS_ORIGIN_DEV :
// process.env.CORS_ORIGIN_PROD;

exports.corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true, // Allows cookies to be sent from frontend to backend
};
