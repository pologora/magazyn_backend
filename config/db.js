/* eslint-disable no-console */
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.NODE_ENV === 'development' ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

module.exports = { client, connectDB };
