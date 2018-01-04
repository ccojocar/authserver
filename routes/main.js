'use strict';

const passport = require('passport');

module.exports.index = (req, res) => {
    res.render('home', {user: req.user });
};

module.exports.loginPage = (req, res) => {
    console.log(req);
    res.render('login', { errors: req.session.flash });
};

module.exports.login = passport.authenticate('local', { successRedirect: '/',
                                                        failureRedirect: '/login',
                                                        failureFlash: true});

module.exports.logout = (req, res) => {
    req.session.destroy((error => {}));
    res.redirect('/');
};

module.exports.profile = (req, res) => {
    res.render('profile', { user: req.user });
};
