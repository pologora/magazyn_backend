// dbSetup.js
const { MongoClient } = require('mongodb');

const uri = '';

(async () => {
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });

  const db = client.db('magazyn');

  const usersCollection = db.collection('Users');

  // Create unique index on email
  await usersCollection.createIndex({ email: 1 }, { unique: true });

  // Create unique index on employeeId
  await usersCollection.createIndex({ employeeId: 1 }, { unique: true });

  console.log('Indexes created successfully');
  client.close();
})();
