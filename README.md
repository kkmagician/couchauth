## Couchauth
A proof of concept project: authorization tools for a webservice using CouchDB.
Server-side code is written in Express, client code is Vue 2.

### How to use it
To run locally, just run `docker-compose up -d` and go to http://localhost:4000 to see a simple Vue frontend with the login page.

Root folder contains `.env` file with a basic configuration for the initialization script:

* COUCHDB_USER, COUCHDB_PASSWORD and NODENAME environment variables are required to start CouchDB with the provided admin username, password and the name for the starting Couch node. It is not recommended to change these settings unless you start anew.
* COUCH_HOST is the hostname of your CouchDB installation. It is not required and defaults to `http://couch:5984` if not specified. This way, local CouchDB from docker-compose internal network is used.
* AUTH_CACHE_SIZE maximum number of users to keep in cache at a time. Please refer to the CouchDB [documentation](https://docs.couchdb.org/en/stable/config/auth.html#couch_httpd_auth/auth_cache_size). Defaults to 50 if not specified.
* PERSISTENT_COOKIES is a boolean that controls if authorization cookies can be kept forever of not. [doc](https://docs.couchdb.org/en/stable/config/auth.html#couch_httpd_auth/allow_persistent_cookies). Defaults to false if not provided.
* SESSION_INVALIDATION_TIMEOUT is the time when auth cookie is invalidated in seconds. [doc](https://docs.couchdb.org/en/stable/config/auth.html#couch_httpd_auth/timeout). Defaults to 600.