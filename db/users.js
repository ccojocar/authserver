const crypto = require('crypto');

class User {
  static getNextId() {
    User.nextId += 1;
    return User.nextId;
  }
  constructor(name, username, password, email, provider) {
    this.id = User.getNextId();
    this.username = username;
    this.displayName = name;
    this.email = email;
    this.provider = provider;

    if (password) {
      const hash = crypto.createHash('sha256');
      hash.update(password);
      this.password = hash.digest('hex');
    }
  }

  verifyPassword(password) {
    if (!this.password) return false;
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

const localProvider = 'local';

module.exports.findById = (id, done) => {
  const user = users.find(u => u.id === id);
  if (user) {
    return done(null, user);
  }
  return done(null);
};

module.exports.findLocalUserByUsername = (username, done) => {
  const foundUser = users.filter(u => u.provider === localProvider).find(user => user.username === username);
  if (foundUser) {
    return done(null, foundUser);
  }
  return done(null);
};

module.exports.saveLocalUser = (name, username, password, email, done) => {
  let foundUser = users.filter(u => u.provider === localProvider).find(user => user.username === username);
  if (foundUser) {
    return done(new Error(`A user with username: ${username} already exists`));
  }
  foundUser = users.filter(u => u.provider === localProvider).find((user => user.email === email));
  if (foundUser) {
    return done(new Error(`A user with email: ${email} already exists`));
  }
  const user = new User(name, username, password, email, localProvider);
  users.push(user);
  return done(null);
};

module.exports.saveExternalUser = (name, username, email, provider, done) => {
  // The claims of an existing external uer are always overwritten
  const foundUser = users.filter(u => u.provider === provider).find(u => u.username === username);
  if (foundUser) {
    foundUser.name = name;
    foundUser.username = username;
    foundUser.email = email;
  } else {
    const user = new User(name, username, undefined, email, provider);
    users.push(user);
    return done(null, user);
  }
  return done(null, foundUser);
};
