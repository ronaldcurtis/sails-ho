var passport    = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  RememberMeStrategy = require('passport-remember-me').Strategy,
  bcrypt = require('bcryptjs');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({id:id}, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({username: username}).exec(function(err, user) {
      if (err) { return done(null, err); }
      if (!user) { return done(null, false, { message: 'Incorrect User'}); }
      bcrypt.compare(password, user.password, function(err, res) {
        if (err) { return done(err); }
        if (!res) { return done(null, false, { message: 'Invalid Password'}); }
        return done(null, user);
      });
    });
  })
);

passport.use(new RememberMeStrategy(
  function(token, cb) {
    User.consumeSessionToken(token, function(err, user) {
      cb(err, user);
    });
  },
  function(token,cb){
    User.issueSessionToken(token,cb);
  }
));


// Mincer
var connectMincer = require('connect-mincer'),
    nib = require('nib'),
    path = require('path'),
    mincer;
 
// Config for connect-mincer
// See https://github.com/clarkdave/connect-mincer for more details
mincer = new connectMincer({
  root: path.join(__dirname, '../'),
  production: process.env.NODE_ENV === 'production',
  mountPoint: '/assets',
  manifestFile: path.join(__dirname, '../.tmp/public/assets/manifest.json'),
  paths: ['assets/']
});
 
// Configure Stylus so it can import css files just like .styl files
// Also allows the use of nib (mixin library for stylus)
// Remove is you're not using nib or stylus
mincer.Mincer.StylusEngine.configure(function(style) {
  style.set('include css', true);
  style.use(nib());
});
 
// Uncomment the lines below to top optionally configure Jade or Coffee 
// See http://nodeca.github.io/mincer for more details
 
// mincer.Mincer.JadeEngine.configure({});
// mincer.Mincer.CoffeeEngine.configure({});


module.exports.express = {

  // customMiddleware allows you to inject a piece of middleware before each request
  // Worth noting that this **only applies to HTTP requests**-- while most parts of Sails work for both
  // HTTP and sockets, and most Express/Connect middleware should work without a problem for both using
  // Sails' built-in interpreter, this configuration exists mainly to allow direct access to the Express 
  // middleware chain.
  //
  // For example, if  you want to use the `connect-flash` middleware:
  /*
  customMiddleware: function (app) {
    var flash = require('connect-flash');
    app.use(flash());
  }
  */
  //
  // Defaults to `false`
  // Disable by setting to `false`
  //
  // customMiddleware: false

  customMiddleware: function(app) {

    app.use(mincer.assets());

    // Connect-mincer serves our assets in dev
    // We must precompile our assets before starting in production
    if (process.env.NODE_ENV !== 'production') {
      app.use('/assets', mincer.createServer());
    }

    // Passport
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));
  }


  // Configures the middleware function used for parsing the HTTP request body
  // Defaults to the Formidable-based version built-in to Express/Connect
  //
  // To enable streaming file uploads (to disk or somewhere else)
  // you'll want to set this to `false` to disable it.
  // Alternatively, if you're comfortable with the bleeding edge,
  // check out: https://github.com/mikermcneil/stream-debug
  //
  // Defaults to `false`
  // Disable by seting to `false`
  //
  // bodyParser: false,



  // If bodyParser doesn't understand the HTTP body request data, 
  // run it again with an artificial header, forcing it to try and parse
  // the request body as JSON
  // (this allows you to use JSON as your request body and have it parsed as parameters
  // without the need to specify a 'Content-type: application/json' header)
  //
  // Defaults to `true`
  // Disable by seting to `false`
  //
  // retryBodyParserWithJSON: true,



  // Cookie parser middleware
  //
  // Defaults to Connect/Express standard
  // Disable by seting to `false`
  //
  // cookieParser: false,



  // HTTP method override middleware
  //
  // This option allows artificial query params to be passed to trick 
  // Express into thinking a different HTTP verb was used.
  // Useful when supporting an API for user-agents which don't allow 
  // PUT or DELETE requests
  // 
  // Defaults to Connect/Express standard
  // Disable by seting to `false`
  //
  // methodOverride: false

};