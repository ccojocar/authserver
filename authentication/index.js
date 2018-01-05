'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db');


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
