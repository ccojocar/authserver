'use strict';

let users = [
    { id: '1', username: 'test', password: 'test', name: "Test User", emails: [ { value: 'test@test.org' } ] }
];

module.exports.findById = (id, done) => {
    for (let user of users) {
        if (user.id === id) {
            return done(null, user);
        }
    }
    return done(new Error("User Not Found"));
};

module.exports.findByUsername = (username, done) => {
    for (let user of users) {
        if (user.username === username) {
            return done(null, user);
        }
    }
    return done(new Error("User Not Found"));
};
