const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const errorHandler = require('errorhandler');
const passport = require('passport');
const crypto = require('crypto');
const routes = require('./routes');
const login = require('connect-ensure-login');
const flash = require('connect-flash');
const auth = require('./authentication');

// CSRF protection
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

// General application configuration
const app = express();
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());

const cookieSecret = crypto.randomBytes(64).toString('hex');
app.use(session({ name: 'authserver-id', secret: cookieSecret, resave: false, saveUninitialized: false }));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Configure GitHub authenticator
const GitHubCallbackURL = "http://localhost:3000/login/github/callback";
auth.configureGitHubAuth(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET,
  GitHubCallbackURL);

// Define the application routes
require('./authentication');

app.get('/', login.ensureLoggedIn(), routes.main.index);
app.get('/login', csrfProtection, routes.main.loginPage);
app.post('/login/method', parseForm, csrfProtection, (req, res) => {
  const redirect = `/login/${req.body.dropdown}`;
  res.redirect(redirect);
});
app.get('/login/userpassword', csrfProtection, routes.main.userpassword);
app.post('/login/userpassword/callback', parseForm, csrfProtection, routes.main.userpasswordCallback);
app.get('/login/github', routes.main.github);
app.get('/login/github/callback', routes.main.githubCallback);
app.get('/logout', login.ensureLoggedIn(), routes.main.logout);
app.get('/singup', csrfProtection, routes.main.singupPage);
app.post('/singup', parseForm, csrfProtection, routes.main.singup);
app.get('/profile', login.ensureLoggedIn(), routes.main.profile);

// OAuth2 routes
app.get('/oauth2/authorize', routes.oauth2.authorization);
app.post('/oauth2/authorization/decision', login.ensureLoggedIn(), routes.oauth2.decision);
app.post(
  '/oauth2/token',
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  routes.oauth2.token);

// User information route which can be accessed only with an access token
app.get(
  '/userinfo',
  passport.authenticate('bearer', { session: false }),
  routes.user.info);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
