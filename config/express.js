var passport = require('passport'),
		connectMincer = require('connect-mincer'),
		nib = require('nib'),
    path = require('path'),
    mincer;

mincer = new connectMincer({
  root: path.join(__dirname, '../'),
  production: process.env.NODE_ENV === 'production',
  mountPoint: '/assets',
  manifestFile: path.join(__dirname, '../.tmp/public/assets/manifest.json'),
  paths: ['assets/']
});

mincer.Mincer.StylusEngine.configure(function(style) {
  style.set('include css', true);
  style.use(nib());
});

module.exports = {
 express: {
    customMiddleware: function(app){
    	// Passport 
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(passport.authenticate('remember-me'));

      // Connect Mincer
      app.use(mincer.assets());
      if (process.env.NODE_ENV !== 'production') {
        app.use('/assets', mincer.createServer());
      }
    }
  }
};