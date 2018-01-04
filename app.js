'use strict';

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const passport = require('passport');
const crypto = require('crypto');
const routes = require('./routes');
const login = require('connect-ensure-login');
const flash = require('connect-flash');

// General application configuration
const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());

const cookieSecret = crypto.randomBytes(64).toString('hex');
app.use(session({ secret: cookieSecret, resave: false, saveUninitialized: false }));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Define the application routes
require('./authentication');
app.get('/', login.ensureLoggedIn(), routes.main.index);
app.get('/login', routes.main.loginPage);
app.post('/login', routes.main.login);
app.get('/logout', login.ensureLoggedIn(), routes.main.logout);
app.get('/profile', login.ensureLoggedIn(), routes.main.profile);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
