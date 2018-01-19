const crypto = require('crypto');
const mongodb = require('./mongodb');

class Client {
  constructor(name, id, clientSecret, redirectURI) {
    this.name = name;
    this.id = id;
    this.clientSecret = clientSecret;
    this.redirectURI = redirectURI;
  }

  verifyClientSecret(clientSecret) {
    const hash = crypto.createHash('sha256');
    hash.update(clientSecret);
    const hashClientSecret = hash.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(this.clientSecret, 'utf8'),
      Buffer.from(hashClientSecret, 'utf8'));
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
