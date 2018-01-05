'use strict';

const crypto = require('crypto');

class User {

  static getNextId() {
    return User.nextId++;
  }
  constructor(name, username, password, email) {
    this.id = User.getNextId();
    this.username = username;
    this.displayName = name;
    this.email = email;

    const hash = crypto.createHash('sha256');
    hash.update(password);
    this.password = hash.digest('hex');
  }

  verifyPassword(password) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const hashPassword = hash.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(this.password, 'utf8'),
                                  Buffer.from(hashPassword, 'utf8'));
  }
}
User.nextId = 0;

let users = [
];

module.exports.findById = (id, done) => {
  for (let user of users) {
    if (user.id === id) {
      return done(null, user);
    }
  }
  return done(null);
};

module.exports.findByUsername = (username, done) => {
  for (let user of users) {
    if (user.username === username) {
      return done(null, user);
    }
  }
  return done(null);
};


module.exports.save = (name, username, password, email, done) => {
  let foundUser = users.find((user => user.username === username));
  if (foundUser) {
    return done(new Error(`A user with username: ${username} already exists`));
  }
  foundUser = users.find((user => user.email === email));
  if (foundUser) {
    return done(new Error(`A user with email: ${email} already exists`));
  }
  const user = new User(name, username, password, email);
  users.push(user);
  return done(null);
};
