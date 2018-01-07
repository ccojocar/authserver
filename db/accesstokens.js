'use strict';

class AccessToken {
  constructor(token, userId, clientId) {
    this.token = token;
    this.userId = userId;
    this.clientId = clientId;
  }
}

let accessTokens = new Map();

module.exports.save = (token, userId, clientId, done) => {
  if (accessTokens.has(token) === false) {
    accessTokens.set(token, new AccessToken(token, userId, clientId));
  }
  return done(null);
};


module.exports.find = (token, done) => {
  return done(null, accessTokens.get(token));
};
