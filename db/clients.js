const crypto = require('crypto');

class Client {
  static getNextId() {
    return Client.nextId++;
  }
  constructor(name, clientId, clientSecret, redirectURI) {
    this.id = Client.getNextId();
    this.name = name;
    this.clientId = clientId;
    this.redirectURI = redirectURI;

    const hash = crypto.createHash('sha256');
    hash.update(clientSecret);
    this.clientSecret = hash.digest('hex');
  }

  verifyClientSecret(clientSecret) {
    const hash = crypto.createHash('sha256');
    hash.update(clientSecret);
    const hashClientSecret = hash.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(this.clientSecret, 'utf8'),
      Buffer.from(hashClientSecret, 'utf8')
    );
  }
}
Client.nextId = 1;

const clients = [
  new Client('Client1', 'c96a5eca-f226-11e7-8c3f-9a214cf093ae', 'Client1Secret', 'http://localhost:3001/oauth2/callback'),
];


module.exports.findByClientId = (clientId, done) => {
  const client = clients.find(c => c.clientId === clientId);
  if (client) {
    return done(null, client);
  }
  return done(null, null);
};

module.exports.findById = (id, done) => {
  const client = clients.find(c => c.id === id);
  if (client) {
    return done(null, client);
  }
  return done(null, null);
};
