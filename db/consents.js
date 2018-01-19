const crypto = require('crypto');
const mongodb = require('./mongodb');

class Consent {
  static buildConsentFromMongoResult(result) {
    return new Consent(
      result.userId,
      result.clientId,
      result.grantedAt,
    );
  }

  constructor(userId, clientId, grantedAt) {
    this.userId = userId;
    this.clientId = clientId;
    if (!grantedAt) {
      this.grantedAt = new Date().getTime();
    } else {
      this.grantedAt = grantedAt;
    }
  }

  isExpired() {
    // the user grant for the client is valid for 1 day
    const lifetime = 84600000;
    const currentTime = new Date().getTime();
    return (this.grantedAt + lifetime) < currentTime;
  }
}

const MONGO_COLLECTION = 'consents';

function findConsent(userId, clientId, done) {
  mongodb.connect((error, db) => {
    if (error) { return done(error); }
    const dbo = db.db(mongodb.DATABASE);
    dbo.collection(MONGO_COLLECTION).findOne({
      userId: userId,
      clientId: clientId
    }, {}, (findError, result) => {
      db.close();
      if (findError) { return done(findError); }
      if (!result) { return done(null, null); }
      const consent = Consent.buildConsentFromMongoResult(result);
      return done(null, consent);
    });
  });
}

module.exports.save = (userId, clientId, done) => {
  findConsent(userId, clientId, (error, foundConsent) => {
    const consent = new Consent(userId, clientId);
    if (foundConsent) {
      const query = { 
        userId: consent.userId,
        clientId: consent.clientId,
      };
      const updatedConsent = { $set: { grantedAt: consent.grantedAt } };
      mongodb.connect((connectError, db) => {
        if (connectError) { return done(connectError); }
        const dbo = db.db(mongodb.DATABASE);
        dbo.collection(MONGO_COLLECTION).updateOne(query, updatedConsent, { upsert: true }, (updateError) => {
          db.close();
          if (updateError) { return done(updateError); }
        });
      });
    } else {
      const newConsent = {
        userId: consent.userId,
        clientId: consent.clientId,
        grantedAt: consent.grantedAt,
      };
      mongodb.connect((connectError, db) => {
        if (connectError) { return done(connectError); }
        const dbo = db.db(mongodb.DATABASE);
        dbo.collection(MONGO_COLLECTION).insertOne(newConsent, (insertError) => {
          db.close();
          if (insertError) { return done(insertError); }
        });
      });
    }
    return done(null);
  })
};


module.exports.hasConsent = (userId, clientId, done) => {
  findConsent(userId, clientId, (error, foundConsent) => {
    if (!foundConsent) {
      return done(null, false);
    }
    if (foundConsent.isExpired()) {
      return done(null, false);
    }
    return done(null, true);
  })
};

