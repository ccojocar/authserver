const mongodb = require('./mongodb');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');

class User {
  static buildUserFromMongoResult(result) {
    return new User(
      result._id,
      result.name,
      result.username,
      result.password,
      result.email,
      result.provider,
    );
  }

  constructor(id, name, username, password, email, provider) {
    this.id = id;
    this.username = username;
    this.displayName = name;
    this.email = email;
    this.provider = provider;
    this.password = password;
  }

  verifyPassword(password, done) {
    if (!this.password || !password) { return done(null, false); }
    if (this.password === '' || password === '') { return done(null, false); }

    bcrypt.compare(password, this.password, (error, equal) => {
      if (error) { return done(error); }
      return done(null, equal);
    });
  }
}

const LOCAL_PROVIDER = 'local';
const MONGO_COLLECTION = 'users';
const BCRYPT_SALT_ROUNDS = 10;

module.exports.findById = (id, done) => {
  mongodb.connect((error, db) => {
    if (error) { return done(error); }
    const dbo = db.db(mongodb.DATABASE);
    dbo.collection(MONGO_COLLECTION).findOne({
      _id: ObjectId(id),
    }, {}, (findError, result) => {
      db.close();
      if (findError) { return done(findError); }
      if (!result) { return done(null); }
      const user = User.buildUserFromMongoResult(result);
      return done(null, user);
    });
  });
};

function findUserByUsername(username, provider, done) {
  mongodb.connect((error, db) => {
    if (error) { return done(error); }
    const dbo = db.db(mongodb.DATABASE);
    dbo.collection(MONGO_COLLECTION).findOne({
      provider: provider,
      username: username,
    }, {}, (findError, result) => {
      db.close();
      if (findError) { return done(findError); }
      if (!result) { return done(null, null); }
      const user = User.buildUserFromMongoResult(result);
      return done(null, user);
    });
  });
}

module.exports.findLocalUserByUsername = (username, done) => findUserByUsername(username, LOCAL_PROVIDER, done);

module.exports.findLocalUserByEmail = (email, done) => {
  mongodb.connect((error, db) => {
    if (error) { return done(error); }
    const dbo = db.db(mongodb.DATABASE);
    dbo.collection(MONGO_COLLECTION).findOne({
      provider: LOCAL_PROVIDER,
      email: email,
    }, {}, (findError, result) => {
      db.close();
      if (findError) { return done(findError); }
      if (!result) { return done(null); }
      const user = User.buildUserFromMongoResult(result);
      return done(null, user);
    });
  });
};

module.exports.saveLocalUser = (name, username, password, email, done) => {
  module.exports.findLocalUserByUsername(username, (usernameError, user) => {
    if (user) {
      return done(new Error(`A user with username: ${username} already exists`));
    }
    module.exports.findLocalUserByEmail(email, (emailError, emailUser) => {
      if (emailUser) {
        return done(new Error(`A user with email: ${email} already exists`));
      }
      bcrypt.hash(password, BCRYPT_SALT_ROUNDS, (bcryptError, hashedPassword) => {
        if (bcryptError) { return done(bcryptError); }
        const newUser = {
          name: name,
          username: username,
          password: hashedPassword,
          email: email,
          provider: LOCAL_PROVIDER,
        };
        mongodb.connect((error, db) => {
          if (error) { return done(error); }
          const dbo = db.db(mongodb.DATABASE);
          dbo.collection(MONGO_COLLECTION).insertOne(newUser, (insertError) => {
            db.close();
            if (insertError) { return done(insertError); }
            return done(null);
          });
        });
      });
    });
  });
};

module.exports.saveExternalUser = (name, username, email, provider, done) => {
  findUserByUsername(username, provider, (error, foundUser) => {
    // The claims of an existing external uer are always overwritten
    if (foundUser) {
      const query = { username: username };
      const updatedUser = { $set: { name: name, email: email } };
      mongodb.connect((connectError, db) => {
        if (connectError) { return done(connectError); }
        const dbo = db.db(mongodb.DATABASE);
        dbo.collection(MONGO_COLLECTION).updateOne(query, updatedUser, { upsert: true }, (updateError) => {
          db.close();
          if (updateError) { return done(updateError); }
        });
      });
    } else {
      const newUser = {
        name: name,
        username: username,
        email: email, 
        provider: provider,
      };
      mongodb.connect((connectError, db) => {
        if (connectError) { return done(connectError); }
        const dbo = db.db(mongodb.DATABASE);
        dbo.collection(MONGO_COLLECTION).insertOne(newUser, (insertError) => {
          db.close();
          if (insertError) { return done(insertError); }
        });
      });
    }

    findUserByUsername(username, provider, (findError, user) => {
      if (findError) { return done(findError); }
      return done(null, user);
    });
  });
};
