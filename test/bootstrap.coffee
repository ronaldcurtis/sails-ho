# # This sets up the testing environment
# # Drops the testing db before and after tests run
# # Starts the sails server before running tests, then stops it after tests are done.
global.expect  = require('expect.js')
global.request = require('supertest')
sails = require('sails')
DbServer = require('../node_modules/sails-mongo/node_modules/mongodb').Server
Db = require('../node_modules/sails-mongo/node_modules/mongodb').Db

createConnection = (config, cb) ->
  safe = if config.safe then 1 else 0
  server = new DbServer config.host, config.port, {native_parser: config.nativeParser, auth: { user: config.user, password: config.password }}
  db = new Db config.database, server, {w: safe, native_parser: config.nativeParser}

  db.open (err)->
    if err then return cb(err)
    if db.serverConfig.options.auth.user && db.serverConfig.options.auth.password
      return db.authenticate db.serverConfig.options.auth.user, db.serverConfig.options.auth.password, (err, success) ->
        if success then return cb(null, db)
        if db then db.close()
        info = do ->
          if err then return err else return new Error('Could not authenticate user ' + auth[0])
        return cb(info, null)
    return cb(null, db)


dropDb = (cb) ->
  createConnection sails.config.connections.mongoDB, (err, db) ->
    db.dropDatabase ->
      cb()

before (done) ->
  console.log('\n---------------\nStarting Server\n---------------\n')
  sails.lift { port: 7357 }, (err, sails) ->
    dropDb ->
      console.log('\n---------------\nTest Results:\n---------------\n')
      done()


after (done) ->
  sails.lower ->
    dropDb ->
      done()
