const crypto = require('crypto');
const oauth2orize = require('oauth2orize');
const login = require('connect-ensure-login');
const db = require('../db');

// OAuth 2.0 server
const server = oauth2orize.createServer();

// Store the client identifier in the session
server.serializeClient((client, done) => done(null, client.id));

/**
 * Restore the client details from database based on the client identifier
 * which was stored into the session.
 */
server.deserializeClient((id, done) => {
  db.clients.findById(id, (error, client) => {
    if (error) return done(error);
    return done(null, client);
  });
});

/**
 * It issues a new code grant to a client after the user is authenticated.
 */
server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
  if (client.redirectURI !== redirectURI) {
    return done(null, false);
  }
  const code = crypto.randomBytes(16).toString('hex');
  db.authcodes.save(code, user.id, client.id, redirectURI, (error) => {
    if (error) { return done(error); }
    return done(null, code);
  });
}));

/**
 * This is executed when a client requrests to exchange an code grant for an access token.
 */
server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {
  db.authcodes.find(code, (error, authCode) => {
    if (error) { return done(error); }
    if (!authCode) { return done(null, false); }
    if (authCode.isExpired()) { return done(null, false); }
    if (authCode.isUsed() === true) { return done(null, false); }
    if (client.id !== authCode.clientId) { return done(null, false); }
    if (redirectURI !== authCode.redirectURI) { return done(null, false); }

    const token = crypto.randomBytes(256).toString('hex');
    db.accessTokens.save(token, authCode.userId, authCode.clientId, (err) => {
      if (err) { return done(err); }
      authCode.markAsUsed();
      return done(null, token);
    });
  });
}));


/**
 * It provides the authorization endpoint which is the entry point of the OAuth 2.0
 *  code grant. At this stage the user must authetnicate and the client should be verified.
 */
module.exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization((clientId, redirectURI, done) => {
    db.clients.findByClientId(clientId, (error, client) => {
      if (error) { return done(error); }
      if (!client) { return done(null, false); }
      if (redirectURI !== client.redirectURI) { return done(null, false); }
      return done(null, client, redirectURI);
    });
  },
  (oauth2, next) => {
    db.consents.hasConsent(oauth2.user.id, oauth2.client.id, (error, consent) => {
      if (error) { return next(error); }
      if (consent === true) { return next(null, true); }
      return next(null, false);
    });
  }),
  (req, res, next) => {
    res.render('consent', { transactionID: req.oauth2.transactionID, client: req.oauth2.client });
  },
];

/**
 * It handles the decision of the user consent.
 */
module.exports.decision = [
  server.decision({
    cancelField: 'deny',
  },
  undefined,
  (req, oauth2, done) => {
    if (oauth2 === undefined) { done(null); }
    db.consents.save(oauth2.user.id, oauth2.client.id, (error) => {
      if (error) { return done(error); }
      return done(null);
    });
  }),
];

/**
 * It provides the token endpoint which is access by a client when it wants to excange a code grant
 * for an access token.
 */
module.exports.token = [
  server.token(),
  server.errorHandler(),
];
