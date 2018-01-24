const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const ClinetPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const db = require('../db');

/**
 *  This strategy is used to authenticate users based on a username and password.
 */
passport.use(new LocalStrategy((username, password, done) => {
  db.users.findLocalUserByUsername(username, (error, user) => {
    if (error) {
      return done(null, false, { message: error.message });
    }
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    if (user.verifyPassword(password) === false) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
  });
}));

/**
 * Store the use identifier into the session
 */
passport.serializeUser((user, done) => done(null, user.id));

/**
 * Store the full user information based on the identifier stored into the session
 */
passport.deserializeUser((id, done) => {
  db.users.findById(id, (error, user) => done(error, user));
});


/**
 * This strategy is used to authenticate a client which provides its credentials in the
 * Authorization header.
 */
passport.use(new BasicStrategy((clientId, clientSecret, done) => {
  db.clients.findById(clientId, (error, client) => {
    if (error) {
      return done(null, false, { message: error.message });
    }
    if (!client) {
      return done(null, false, { message: 'Client not found' });
    }
    if (client.verifyClientSecret(clientSecret) === false) {
      return done(null, false, { message: 'Incorrect client password' });
    }
    return done(null, client);
  });
}));

/**
 * This strategy is used to authenticate a client which provides its credentials in the
 * HTTP body (e.g. passport-oauth2).
 */
passport.use(new ClinetPasswordStrategy((clientId, clientSecret, done) => {
  db.clients.findById(clientId, (error, client) => {
    if (error) {
      return done(null, false, { message: error.message });
    }
    if (!client) {
      return done(null, false, { message: 'Client not found' });
    }
    if (client.verifyClientSecret(clientSecret) === false) {
      return done(null, false, { message: 'Incorrect client password' });
    }
    return done(null, client);
  });
}));

/**
 * This strategy is used to authenticate a user based on an access token which is
 * provided as a bearer token (e.g. to retrieve the user information).
 */
passport.use(new BearerStrategy((accessToken, done) => {
  db.accessTokens.find(accessToken, (error, token) => {
    if (error) { return done(error); }
    if (!token) { return done(null, false); }
    if (token.isExpired()) { return done(null, false); }
    if (token.userId != null) {
      db.users.findById(token.userId, (err, user) => {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
      });
    } else {
      return done(null, false);
    }
  });
}));

/**
 * This strategy is used to authenticate a user with the GitHub IdP
 */
module.exports.configureGitHubAuth = (clientID, clientSecret, callbackURL) => {
  passport.use(new GitHubStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callbackURL,
  },
  (accessToken, refreshToken, profile, done) => {
    if (!accessToken) { return done(null, false); }
    if (!profile) { return done(null, false); }
    let email = '';
    if (profile.emails && profiles.emails.length > 0) {
      email = profile.emails[0];
    }
    db.users.saveExternalUser(
      profile.displayName,
      profile.username,
      email,
      profile.provider,
      (error, user) => {
        if (error) { return done(error, user); }
        return done(null, user);
      });
  }));
};
