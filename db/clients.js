const mongodb = require('./mongodb');
const bcrypt = require('bcrypt');

class Client {
  constructor(name, id, clientSecret, redirectURI) {
    this.name = name;
    this.id = id;
    this.clientSecret = clientSecret;
    this.redirectURI = redirectURI;
  }

  verifyClientSecret(clientSecret, done) {
    if (clientSecret === '' || this.clientSecret === '') { return done(null, false); }
    bcrypt.compare(clientSecret, this.clientSecret, (bcryptError, equal) => {
      if (bcryptError) { return done(bcryptError); }
      return done(null, equal);
    });
  }
}

const MONGO_COLLECTION = 'clients';

module.exports.findById = (id, done) => {
  mongodb.connect((error, db) => {
    if (error) { return done(error); }
    const dbo = db.db(mongodb.DATABASE);
    dbo.collection(MONGO_COLLECTION).findOne({
      clientId: id,
    }, {}, (findError, result) => {
      db.close();
      if (findError) { return done(findError); }
      if (!result) { return done(new Error('Client not found')); }
      const client = new Client(
        result.name,
        result.clientId,
        result.clientSecret,
        result.redirectURI,
      );
      return done(null, client);
    });
  });
};
