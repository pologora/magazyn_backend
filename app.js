const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/usersRoutes');
const employeeRouter = require('./routes/employeesRoutes');
const worktimeRouter = require('./routes/worktimeRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/employees', employeeRouter);
// app.use('/api/v1/users', vacationRouter);  vacations
app.use('/api/v1/worktime', worktimeRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
