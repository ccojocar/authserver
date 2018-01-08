class AuthCode {
  constructor(code, userId, clientId, redirectURI) {
    this.code = code;
    this.used = false;
    this.userId = userId;
    this.clientId = clientId;
    this.redirectURI = redirectURI;
  }

  isUsed() {
    return this.used;
  }

  markAsUsed() {
    this.used = true;
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
