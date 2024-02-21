const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const usersRouter = require('./routes/usersRoutes');
const employeesRouter = require('./routes/employeesRoutes');
const worktimeRouter = require('./routes/worktimeRoutes');
const vacationsRouter = require('./routes/vacationsRoutes');
const vacationsProposalsRouter = require('./routes/vacationsProposalsRoutes');
const adminSettingsRouter = require('./routes/adminSettingsRoutes');
const agenciesRouter = require('./routes/agenciesRoutes');
const lastYearLeftDaysRouter = require('./routes/lastYearVacationDaysLeftRoutes');

const app = express();

// 1) globals middlewares

// security headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request, please try again in an hour!',
});

// limit request from users
app.use('/api', limiter);

// cors
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true, // Allows cookies to be sent from frontend to backend
};
app.use(cors(corsOptions));

// body parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// test middleware
app.use((req, res, next) => {
  console.log('test middleware', req.cookies);
  next();
});

// Data sanitization against noSql query injection
app.use(mongoSanitize());
// Data sanitization against xss

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/employees', employeesRouter);
app.use('/api/v1/worktime', worktimeRouter);
app.use('/api/v1/vacations', vacationsRouter);
app.use('/api/v1/proposals', vacationsProposalsRouter);
app.use('/api/v1/settings', adminSettingsRouter);
app.use('/api/v1/agencies', agenciesRouter);
app.use('/api/v1/last', lastYearLeftDaysRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
