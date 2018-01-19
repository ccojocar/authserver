const mongodb = require('./mongodb');

class AccessToken {
  static buildAccessTokenFromMongoResult(result) {
    return new AccessToken(
      result.token,
      result.userId,
      result.clientId,
      result.issuedAt,
    );
  }

  constructor(token, userId, clientId, issuedAt) {
    this.token = token;
    this.userId = userId;
    this.clientId = clientId;
    if (!issuedAt) {
      this.issuedAt = new Date().getTime();
    } else {
      this.issuedAt = issuedAt;
    }
  }

  isExpired() {
    // the access token is valid for 1 hour
    const lifetime = 3600000;
    const currentTime = new Date().getTime();
    return (this.issuedAt + lifetime) < currentTime;
  }
}

const MONGO_COLLECTION = 'accessTokens';

module.exports.save = (token, userId, clientId, done) => {
  mongodb.connect((connectError, db) => {
    if (connectError) { return done(connectError); }
    const dbo = db.db(mongodb.DATABASE);
    const accessToken = new AccessToken(token, userId, clientId);
    dbo.collection(MONGO_COLLECTION).insertOne(accessToken, (insertError) => {
      db.close();
      if (insertError) { return done(insertError); }
      return done(null);
    });
  });
};

module.exports.find = (token, done) => {
  mongodb.connect((connectError, db) => {
    if (connectError) { return done(connectError); }
    const dbo = db.db(mongodb.DATABASE);
    dbo.collection(MONGO_COLLECTION).findOne({
      token: token,
    }, {}, (findError, result) => {
      db.close();
      if (findError) { return done(findError); }
      if (!result) { return done(null, null); }
      const accessToken = AccessToken.buildAccessTokenFromMongoResult(result);
      return done(null, accessToken);
    });
  });
};
