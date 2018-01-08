class AuthCode {
  constructor(code, userId, clientId, redirectURI) {
    this.code = code;
    this.used = false;
    this.userId = userId;
    this.clientId = clientId;
    this.redirectURI = redirectURI;
    this.issuedAt = new Date().getTime();
  }

  isUsed() {
    return this.used;
  }

  markAsUsed() {
    this.used = true;
  }

  isExpired() {
    // the code grant is valid for 5 minutes
    const lifetime = 300000;
    const currentTime = new Date().getTime();
    return (this.issuedAt + lifetime) < currentTime;
  }
}

const authCodes = new Map();

module.exports.save = (code, userId, clientId, redirectURI, done) => {
  if (authCodes.has(code) === false) {
    authCodes.set(code, new AuthCode(code, userId, clientId, redirectURI));
  }
  return done(null);
};

module.exports.find = (code, done) => done(null, authCodes.get(code));
