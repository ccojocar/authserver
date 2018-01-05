'use strict';

const crypto = require('crypto');
const oauth2orize = require('oauth2orize');
const passport = require('passport');
const login = require('connect-ensure-login');
const db = require('../db');

// OAuth 2.0 server
const server = oauth2orize.createServer();


// Store the client identifier in the session
server.serializeClient((client, done) => {
  return done(null, client.id);
});

// Restore the client details from database based on the client identifier
// which was stored into the session
server.deserializeClient((id, done) => {
  db.clients.find(id, (error, client) => {
    if (error) return done(error);
    return done(null, client);
  });
});


server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
  if (client.redirectURI !== redirectURI) {
    return done(null, false);
  }
  const code = crypto.randomBytes(16).toString('hex');
  db.authcodes.save(code, user.id, client.id, redirectURI, (error) => {
    if (error) { return done(error); }
    return done(null, code);
  });
  return done(null, null);
}));


server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {
  db.authcodes.find(code, (error, authCode) => {
    if (error) { return done(error); }
    if (authCode.isUsed() === true) { return done(null, false); }
    if (client.id !== authCode.clientId) { return done(null, false); }
    if (redirectURI !== authCode.redirectURI) { return done(null, false); }

    const token = crypto.randomBytes(256).toString('hex');
    db.accessTokens.save((token, authCode.userId, authCode.clientId, (error) => {
      if (error) { return done(error); }
      authCode.markAsUsed();
      return done(null, token);
    }));
    return done(null, null);
  });
}));


module.exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization((clientId, redirectURI, done) => {
    db.clients.find(clientId, (error, client) => {
      if (error) { return done(error);}
      if (redirectURI !== client.redirectURI) {return done(null, false); }
      return done(null, client, redirectURI);
    });
  }),
  (req, res) => {
    res.render('consent', { csrfToken: req.csrfToken(), client: req.oauth2.client });
  }
];


module.exports.decision = [
  login.ensureLoggedIn(),
  server.decision()
];

module.exports.token = [
  passport.authenticate(['basic'], {session: false}),
  server.token(),
  server.errorHandler()
];
