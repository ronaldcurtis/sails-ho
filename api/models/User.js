/**
 * User
 *
 * @module      :: Model
 * @description :: Users who can use the admin
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var bcrypt = require('bcryptjs');
module.exports = {

	schema: true,

  attributes: {
  	
  	username: {
  		type: 'alphanumericdashed',
  		required: true,
  		unique: true
  	},

  	email: {
  		type: 'email',
  		required: true,
  		unique: true
  	},

  	password: {
  		type: 'string',
  		minLength: 6,
  		required: true,
  		columnName: 'encryptedPassword'
  	},

  	sessionTokens: {
  		type: 'array'
  	},

		toJSON: function() {
			var obj = this.toObject();
			delete obj.password;
			delete obj.accessToken;
			delete obj._csrf;
			return obj;
		},

    consumeSessionToken: function(token, cb) {
      if (this.sessionTokens) {
        var i = this.sessionTokens.length;
        while (i--) {
          if (this.sessionTokens[i].token == token) {
            delete this.sessionTokens[i];
            break;
          }
        }
      }

      // Remove falsey tokens
      this.sessionTokens = _.compact(this.sessionTokens);

      this.save(function(err) {
        return cb(err, this);
      });
    }
  },
  // End Attributes and instance methods

	beforeCreate: function(values, next) {
		if (!values.password || values.password != values.passwordConfirm ) {
			return next({err:'Passwords do not match'});
		}
		bcrypt.genSalt(10, function(err, salt) {
			if (err){return next(err);}
			bcrypt.hash(values.password, salt, function(err, hash) {
				if (err){return next(err);}
				values.password = hash;
				next();
			});
		});
	},


  issueSessionToken: function(user, cb) {
    if (!user || typeof user === 'function') return cb(Error("A user model must be supplied"));

    if (!user.sessionTokens) {
      user.sessionTokens = [];
    }

    var token = Token.generate();

    user.sessionTokens.push({
      token: token,
      issuedAt: new Date()
    });

    user.save(function(err) {
      cb(err, token);
    });
  },


  consumeSessionToken: function(token, cb) {
    if (!token || typeof token === 'function') return cb(Error("A token must be supplied"));

    User.findOne({'sessionTokens.token': token}, function(err, user) {
      if (err) return cb(err);
      if (!user) return cb(null, false);

      //Find user with token and delete the token
      if (user.sessionTokens) {
        var i = user.sessionTokens.length;
        while (i--) {
          if (user.sessionTokens[i].token == token) {
            delete user.sessionTokens[i];
            break;
          }
        }
      }

      // Remove falsey tokens
      user.sessionTokens = _.compact(user.sessionTokens);

      user.save(function(err) {
        return cb(err, user);
      });

    });
  }

};
