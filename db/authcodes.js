const mongodb = require('./mongodb');

class AuthCode {
  static buildAuthCodeFromMongoResult(result) {
    return new AuthCode(
      result.code,
      result.userId,
      result.clientId,
      result.redirectURI,
      result.used,
      result.issuedAt,
    );
  }

  constructor(code, userId, clientId, redirectURI, used, issuedAt) {
    this.code = code;
    if (!used) {
      this.used = false;
    } else {
      this.used = used;
    }
    this.userId = userId;
    this.clientId = clientId;
    this.redirectURI = redirectURI;
    if (!issuedAt) {
      this.issuedAt = new Date().getTime();
    } else {
      this.issuedAt = issuedAt;
    }
  }

  isUsed() {
    return this.used;
  }

  isExpired() {
    // the code grant is valid for 5 minutes
    const lifetime = 300000;
    const currentTime = new Date().getTime();
    return (this.issuedAt + lifetime) < currentTime;
  }
}

const MONGO_COLLECTION = 'authcodes';

module.exports.save = (code, userId, clientId, redirectURI, done) => {
  mongodb.connect((connectError, db) => {
    if (connectError) { return done(connectError); }
    const dbo = db.db(mongodb.DATABASE);
    const authCode = new AuthCode(code, userId, clientId, redirectURI);
    dbo.collection(MONGO_COLLECTION).insertOne(authCode, (insertError) => {
      db.close();
      if (insertError) { return done(insertError); }
      return done(null);
    });
  });
};

module.exports.find = (code, done) => {
  mongodb.connect((connectError, db) => {
    if (connectError) { return done(connectError); }
    const dbo = db.db(mongodb.DATABASE);
    dbo.collection(MONGO_COLLECTION).findOne({
      code: code,
    }, {}, (findError, result) => {
      db.close();
      if (findError) { return done(findError); }
      if (!result) { return done(null, null); }
      const authCode = AuthCode.buildAuthCodeFromMongoResult(result);
      return done(null, authCode);
    });
  });
};


module.exports.markAsUsed = (code, done) => {
  mongodb.connect((connectError, db) => {
    if (connectError) { return done(connectError); }
    const dbo = db.db(mongodb.DATABASE);
    const query = { code: code };
    const updatedAuthCode = { $set: { used: true } };
    dbo.collection(MONGO_COLLECTION).updateOne(query, updatedAuthCode, { upsert: true }, (updateError) => {
      db.close();
      if (updateError) { return done(updateError); }
      return done(null);
    });
  });
};
