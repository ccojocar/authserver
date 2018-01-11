const crypto = require('crypto');

class Consent {
  constructor(userId, clientId) {
    this.userId = userId;
    this.clientId = clientId;
    this.grantedAt = new Date().getTime();
  }

  isExpired() {
    // the user grant for the client is valid for 1 day
    const lifetime = 84600000;
    const currentTime = new Date().getTime();
    return (this.grantedAt + lifetime) < currentTime;
  }
}

function computeMapKey(...values) {
  const stringValues = values.map(String);
  const key = stringValues.join('-');
  const hash = crypto.createHash('sha256');
  hash.update(key);
  return hash.digest('hex');
}

const consents = new Map();

module.exports.save = (userId, clientId, done) => {
  const key = computeMapKey(userId, clientId);
  consents.set(key, new Consent(userId, clientId));
  return done(null);
};


module.exports.hasConsent = (userId, clientId, done) => {
  const key = computeMapKey(userId, clientId);
  const consent = consents.get(key);
  if (consent === undefined) {
    return done(null, false);
  }
  if (consent.isExpired()) {
    // clean up the expired consent
    consents.delete(key);
    return done(null, false);
  }
  return done(null, true);
};
