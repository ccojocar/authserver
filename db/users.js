const crypto = require('crypto');

class User {
  static getNextId() {
    User.nextId += 1;
    return User.nextId;
  }
  constructor(name, username, password, email, userNameGitHub) {
    this.id = User.getNextId();
    this.username = username;
    this.displayName = name;
    this.email = email;
    this.userNameGitHub = userNameGitHub;

    const hash = crypto.createHash('sha256');
    hash.update(password);
    this.password = hash.digest('hex');
  }

  verifyPassword(password) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const hashPassword = hash.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(this.password, 'utf8'),
      Buffer.from(hashPassword, 'utf8'));
  }
}
User.nextId = 0;

const users = [
];

module.exports.findById = (id, done) => {
  const user = users.find(u => u.id === id);
  if (user) {
    return done(null, user);
  }
  return done(null);
};

module.exports.findByUsername = (username, done) => {
  const user = users.find(u => u.username === username);
  if (user) {
    return done(null, user);
  }
  return done(null);
};


module.exports.findByGitHubUserName = (userNameGitHub, done) => {
  const user = users.find(u => u.userNameGitHub === userNameGitHub);
  if (user) {
    return done(null, user);
  }
  return done(null);
};

module.exports.save = (name, username, password, email, userNameGitHub, done) => {
  let foundUser = users.find((user => user.username === username));
  if (foundUser) {
    return done(new Error(`A user with username: ${username} already exists`));
  }
  foundUser = users.find((user => user.email === email));
  if (foundUser) {
    return done(new Error(`A user with email: ${email} already exists`));
  }
  const user = new User(name, username, password, email, userNameGitHub);
  users.push(user);
  return done(null);
};
