const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {
  // Force IPv4 and add retries for Atlas SRV DNS issues on Windows
  const opts = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4,           // force IPv4 — fixes querySrv ECONNREFUSED on Windows
    retryWrites: true,
  };

  // Add database name to URI if not already present
  let uri = MONGODB_URI;
  if (uri.includes('mongodb+srv') && !uri.includes('.net/')) {
    uri = uri.replace('mongodb.net/?', 'mongodb.net/hemolink?');
    uri = uri.replace('mongodb.net?',  'mongodb.net/hemolink?');
  }

  await mongoose.connect(uri, opts);
  console.log('✅ MongoDB connected successfully');
}

module.exports = connectDB;
