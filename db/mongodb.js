const MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://localhost:27017/";

module.exports.connect = done =>
  MongoClient.connect(mongoURL, (error, db) => done(error, db));

module.exports.DATABASE = 'oauth2';
