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
    User.findOne({username: username}).done(function(err, user) {
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
  User.issueSessionToken
));