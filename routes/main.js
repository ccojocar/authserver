'use strict';

const passport = require('passport');
const db = require('../db');

module.exports.index = (req, res) => {
  res.render('home', { user: req.user });
};

module.exports.loginPage = (req, res) => res.render('login',
  { errors: req.session.flash, csrfToken: req.csrfToken() });

module.exports.login = (req, res) => {
  const successRedirect = req.session.returnTo || '/';
  passport.authenticate('local', {
    successRedirect: successRedirect,
    failureRedirect: '/login',
    failureFlash: true
  })(req, res);
};

module.exports.singupPage = (req, res) => res.render('singup',
  { csrfToken: req.csrfToken() });

module.exports.singup = (req, res) => {
  // TODO: verify the email address by sending a confirmation URL
  db.users.save(req.body.name, req.body.username, req.body.password, req.body.email, (error) => {
    if (error) {
      console.log(`Failed to store the user: ${error}`);
    }
  });

  res.redirect('/login');
};

module.exports.logout = (req, res) => {
  req.session.destroy((error => { }));
  res.redirect('/');
};

module.exports.profile = (req, res) => {
  res.render('profile', { user: req.user });
};
