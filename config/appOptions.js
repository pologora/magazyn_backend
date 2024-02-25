// const origin = process.env.NODE_ENV === 'development' ? process.env.CORS_ORIGIN_DEV :
// process.env.CORS_ORIGIN_PROD;

exports.corsOptions = {
  origin: ['http://localhost:5173',
    'http://localhost:3001',
    'http://app.server266411.nazwa.pl',
    'http://admin.server266411.nazwa.pl',
    'https://app.server266411.nazwa.pl',
    'https://admin.server266411.nazwa.pl',
  ],
  credentials: true, // Allows cookies to be sent from frontend to backend
};
