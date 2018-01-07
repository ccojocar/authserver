'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const ClinetPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const db = require('../db');


/**
 *  This strategy is used to authenticate users based on a username and password.
 */
passport.use(new LocalStrategy(
  (username, password, done) => {
    db.users.findByUsername(username, (error, user) => {
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
  }
));


passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  db.users.findById(id, (error, user) => done(error, user));
});


/**
 * This strategy is used to authenticate a client which provides its credentials in the
 * Authorization header.
 */
passport.use(new BasicStrategy(
  (clientId, clientSecret, done) => {
    db.clients.findByClientId(clientId, (error, client) => {
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
  }
));

/**
 * This strategy is used to authenticate a client which provides its credentials in the 
 * HTTP body (e.g. passport-oauth2).
 */
passport.use(new ClinetPasswordStrategy(
  (clientId, clientSecret, done) => {
    db.clients.findByClientId(clientId, (error, client) => {
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
  }
));