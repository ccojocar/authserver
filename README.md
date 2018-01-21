# authserver

This is a basic OpenID Connect IdP based on [oauth2orize](https://github.com/jaredhanson/oauth2orize/) framework. It implements the authorization code grant flow and provides an endpoint from where the user details can be retrieved.

## Usage

### Client Registration

Before using the identity provider, you must register a client in a MongoDB which it will be used as backend. First you need to compute the SHA256 of the client secret.

```bash
echo -n "<CLIENT SECRET> | shasum -a 256
```

You can now start a MongoDB shell and create a new client:

```bash
mongo

> use oauth2
> db.createCollection("clients")
> db.clients.insert({name: "Client1", clientId: "c96a5eca-f226-11e7-8c3f-9a214cf093ae", clientSecret: "<SHA256 of CLIENT SECRET>", redirectURI: "http://localhost:3001/oauth2/callback"})

```

### GitHub Login

In addition to user/password based login, the identity provider supports also the GitHub authentication. You can create a new application at [developer applications](https://github.com/settings/applications/new) with GitHub's settings panel. You must use as callback URL `http://localhost:3000/login/github/callback`, if you start locally the server. Your application will be issued a client ID and a client secret which can be provided as environment variables before starting the server.

```bash
export GITHUB_CLIENT_ID=<GITHUB APPLICATION ID>
export GITHUB_CLIENT_SECRET=<GITHUB APPLICATION SECRET>
```

### Start the Identity Provider

The server will connect by default to the local MongoDB available at `mongodb://localhost:27017/`.

```bash
npm install
node app.js
```

### Register a new Local User

A new local user can be registered at `http://localhost:3000/singup`. The provided user details will be stored in the MongoDB.

### Run a Test Client

You can test the authorization flow by using the [authclient](https://github.com/cosmincojocar/authclient).

```bash
git clone https://github.com/cosmincojocar/authclient
cd authclient
export CLIENT_ID=<CLIENT ID>
export CLIENT_SECRET=<CLIENT_SECRET>
npm install
node app.js
```

In a browser open the `http://localhost:3001/userinfo` URL, the client will initiate first the authorization flow to acquire an access token. This token will be used afterwards to retrieve the user details from identity provider.