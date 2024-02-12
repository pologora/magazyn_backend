const express = require('express');
const morgan = require('morgan');
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

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

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
