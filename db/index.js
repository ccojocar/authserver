'use strict';

const users = require('./users');
const clients = require('./clients');
const authcodes = require('./authcodes');
const accessTokens = require('./accesstokens');

module.exports = {
  users,
  clients,
  authcodes,
  accessTokens
};
