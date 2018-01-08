class AccessToken {
  constructor(token, userId, clientId) {
    this.token = token;
    this.userId = userId;
    this.clientId = clientId;
    this.issuedAt = new Date().getTime();
  }

  isExpired() {
    // the access token is valid for 1 hour
    const lifetime = 3600000;
    const currentTime = new Date().getTime();
    return (this.issuedAt + lifetime) < currentTime;
  }
}

const accessTokens = new Map();

module.exports.save = (token, userId, clientId, done) => {
  if (accessTokens.has(token) === false) {
    accessTokens.set(token, new AccessToken(token, userId, clientId));
  }
  return done(null);
};

module.exports.find = (token, done) => done(null, accessTokens.get(token));
