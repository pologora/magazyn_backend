// const origin = process.env.NODE_ENV === 'development' ? process.env.CORS_ORIGIN_DEV :
// process.env.CORS_ORIGIN_PROD;

exports.corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:3000',
    'https://www.admin.snti.pl',
    'https://admin.snti.pl/',
    'https://www.app.snti.pl/',
    'https://app.snti.pl/',
  ],
  credentials: true, // Allows cookies to be sent from frontend to backend
};
