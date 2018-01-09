const passport = require('passport');
const db = require('../db');

module.exports.index = (req, res) => {
  res.render('home', { user: req.user });
};

module.exports.loginPage = (req, res) => res.render(
  'login',
  { errors: req.session.flash, csrfToken: req.csrfToken() });

module.exports.userpassword = (req, res) => res.render(
  'userpassword',
  { errors: req.session.flash, csrfToken: req.csrfToken() });

module.exports.userpasswordCallback = (req, res) => {
  const redirect = req.session.returnTo || '/';
  passport.authenticate('local', {
    successRedirect: redirect,
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res);
};

let redirectGitHub = '';
module.exports.github = (req, res) => {
  redirectGitHub = req.session.returnTo || '/';
  passport.authenticate('github')(req, res);
};

module.exports.githubCallback = (req, res) => {
  passport.authenticate('github', {
    successRedirect: redirectGitHub,
    failureRedirect: '/login',
  })(req, res);
};

module.exports.singupPage = (req, res) => res.render(
  'singup',
  { csrfToken: req.csrfToken() });

module.exports.singup = (req, res) => {
  // TODO: verify the email address by sending a confirmation URL
  db.users.save(
    req.body.name,
    req.body.username,
    req.body.password,
    req.body.email,
    req.body.userNameGitHub,
    (error) => {
      if (error) {
        res.status(500).send(`Failed to stored the user with error: ${error}`);
      }
  });

  res.redirect('/login');
};

module.exports.logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).send(`Failed to logout with error: ${error}`);
    } else {
      res.redirect('/');
    }
  });
};

module.exports.profile = (req, res) => {
  res.render('profile', { user: req.user });
};
