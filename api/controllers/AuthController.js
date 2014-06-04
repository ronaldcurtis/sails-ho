/**
 * AuthController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var passport = require('passport');
module.exports = {
    
  register: function(req, res) {
    res.render('auth/register');
  },

  registerUser: function(req, res, next) {
    form = req.params.all();
    User.create(form, function(err, savedUser) {
      if (err) {
        return res.json(500, err);
      }
      res.json(savedUser)
    });
  },

  showLogin: function(req, res) {
  	res.render('auth/login');
  },

  processLogin: function(req, res) {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return res.serverError(err);
      }
      if ((!user)) {
        return res.badRequest(info);
      }
      req.logIn(user, function(err) {
        if (err) { return res.serverError(err); }
        if (!req.body.remember) {
          return res.send('Login Successful');
        }
        User.issueSessionToken(user, function(err, token) {
          if (err) return res.serverError(err);
          res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 60*60*24*30} );
          return res.send('Login Successful and remember_me token issued');
        });
      });
    })(req,res);
  },

  showAdmin: function(req, res) {
    res.render('admin');
  },

  logout: function(req,res) {
    if (!req.user) return res.redirect('/login');

    //Clear tokens
    req.user.consumeSessionToken(req.cookies.remember_me, function(err) {
      if (err) return res.serveError(err);
      // Clear cookie
      res.clearCookie('remember_me');
      req.logout();
      res.send('Log Out successful');
    });
  }
};
