# describe "User Model:", ->

#   describe "Password encryption", ->

#     describe "for a new user", ->
#       user = null

#       before (done) ->
# 				userData =
# 					username: "testuser"
# 					email: "testuser@sails.com"
# 					password: "test_password"
# 					passwordConfirmation: "test_password"

# 				User.create userData, (err, newUser) ->
# 					if (err) then return cb(err)
# 					user = newUser
# 					done()

# 			after (done) ->
# 				user.destroy (err) ->
# 					done(err)

# 			it "must encrypt the password", ->
# 				expect(user.encrypterPassword).to.be.ok()
# 				# user.must.not.have.property('password');
# 				# user.must.not.have.property('passwordConfirmation');



