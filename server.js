/* eslint-disable no-console */
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught exception! Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const { connectDB } = require('./config/db');

const app = require('./app');

connectDB();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server runs on port: ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandler rejection! Shutting down...');
  server.close(() => process.exit(1));
});
