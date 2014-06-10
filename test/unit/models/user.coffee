util = require('util')
bcrypt = require('bcryptjs')
describe "User Model:", ->

	# Creating a new user
	describe "When creating a new user", ->
		describe "username:", ->

			it "must be required", (done) ->
				userData =
					email: "testuser@sails.com"
					password: "test_password"
					passwordConfirm: "test_password"

				User.create(userData).exec (err,newUser) ->
					expect(err).to.be.ok()
					User.destroy(newUser).exec ->
						done()

			it "must not be more than 50 chars", (done) ->
				userData =
					username: "123456789012345678901234567890123456789012345678901"
					email: "testuser@sails.com"
					password: "test_password"
					passwordConfirm: "test_password"
				
				userData2 =
					username: "12345678901234567890123456789012345678901234567890"
					email: "testuser@sails.com"
					password: "test_password"
					passwordConfirm: "test_password"

				User.create(userData).exec (err,newUser) ->
					expect(err).to.be.ok()
					User.destroy(newUser).exec (err)->
						if err then throw err
						# Also test username length of 50 is ok
						User.create(userData2).exec (err, newUser) ->
							expect(err).to.not.be.ok()
							User.destroy(newUser).exec (err)->
								if err then throw err
								done()
			# TODO: uncomment below once issue fixed in sails-mongo
			# it "must be unique", (done) ->
			# 	userData =
			# 		username: 'hello'
			# 		email: "testuser@sails.com"
			# 		password: "test_password"
			# 		passwordConfirm: "test_password"

			# 	userData2 =
			# 		username: 'hello'
			# 		email: "testuser2@sails.com"
			# 		password: "test_password"
			# 		passwordConfirm: "test_password"

			# 	User.create(userData).exec (err,newUser) ->
			# 		if err then throw err
			# 		User.create(userData2).exec (err, newUser) ->
			# 			expect(err).to.be.ok()
			# 			done()
		describe "email:", ->

			it "must be required", (done) ->
				userData =
					username: "testuser"
					password: "test_password"
					passwordConfirm: "test_password"

				User.create(userData).exec (err,newUser) ->
					expect(err).to.be.ok()
					User.destroy(newUser).exec (err)->
						if err then throw err
						done()

		describe "password:", ->

			it "must be required", (done) ->
				userData =
					username: "testuser"
					email: "testuser@sails.com"

				User.create(userData).exec (err,newUser) ->
					expect(err).to.be.ok()
					User.destroy(newUser).exec (err)->
						if err then throw err
						done()

			it "must be at least 6 chars", (done) ->
				userData =
					username: "testuser"
					email: "testuser@sails.com"
					password: "test"
					passwordConfirm: "test"

				userData2 =
					username: "testuser"
					email: "testuser@sails.com"
					password: "123456"
					passwordConfirm: "123456"

				User.create(userData).exec (err,newUser) ->
					expect(err).to.be.ok()
					User.destroy(newUser).exec (err)->
						if err then throw err
						# Also test password length of 6 is ok
						User.create(userData2).exec (err, newUser) ->
							expect(err).to.not.be.ok()
							User.destroy(newUser).exec (err)->
								if err then throw err
								done()

			it "must not be more than 50 chars", (done) ->
				userData =
					username: "testuser"
					email: "testuser@sails.com"
					password: "123456789012345678901234567890123456789012345678901"
					passwordConfirm: "123456789012345678901234567890123456789012345678901"
				
				userData2 =
					username: "testuser"
					email: "testuser@sails.com"
					password: "12345678901234567890123456789012345678901234567890"
					passwordConfirm: "12345678901234567890123456789012345678901234567890"

				User.create(userData).exec (err,newUser) ->
					expect(err).to.be.ok()
					User.destroy(newUser).exec (err)->
						if err then throw err
						# Also test password length of 50 is ok
						User.create(userData2).exec (err, newUser) ->
							expect(err).to.not.be.ok()
							User.destroy(newUser).exec (err)->
								if err then throw err
								done()

			it "must be equal to passwordConfirm", (done) ->
				userData =
					username: "testuser"
					email: "testuser@sails.com"
					password: "test_password"
					passwordConfirm: "asdasd"

				User.create(userData).exec (err,newUser) ->
					expect(err).to.be.ok()
					User.destroy(newUser).exec (err)->
						if err then throw err
						done()

			it "must be encrypted", (done) ->
				userData =
					username: "testuser"
					email: "testuser@sails.com"
					password: "test_password"
					passwordConfirm: "test_password"

				User.create(userData).exec (err,newUser) ->
					if err then throw err
					expect(newUser.password).to.be.a('string')
					expect(newUser.password).to.not.be('test_password')
					bcrypt.compare 'test_password', newUser.password, (err, isEqual) ->
						expect(isEqual).to.be(true)
						User.destroy(newUser).exec (err)->
							if err then throw err
							done()
	
	# When Updating a user
	describe "When Updating a user", ->
		user = null

		before (done) ->
			userData =
				username: "testuser"
				email: "testuser@sails.com"
				password: "test_password"
				passwordConfirm: "test_password"

			User.destroy({username: 'testuser'}).exec (err)->
				if err then throw err
				User.create(userData).exec (err,newUser) ->
					if err then throw err
					user = newUser
					done()

		after (done) ->
			User.destroy({username: 'testuser'}).exec (err)->
				done(err)

		# Password
		describe "password:", ->

			it "must be encrypted if it changes", (done) ->
				oldHashedPass = null
				User.update({username: 'testuser'}, {password: 'test_password2'}).exec (err, updated) ->
					if err then throw err
					expect(updated[0].password).to.be.a('string')
					expect(updated[0].password).to.not.be('test_password2')
					expect(updated[0].password).to.not.be(oldHashedPass)
					bcrypt.compare 'test_password2', updated[0].password, (err, isEqual) ->
						expect(isEqual).to.be(true)
						done()

	# Session Tokents
	describe "Session Tokens", ->
		user = null

		# Password
		describe "User.issueSessionToken", ->

			before (done) ->
				userData =
					username: "testuser"
					email: "testuser@sails.com"
					password: "test_password"
					passwordConfirm: "test_password"

				User.destroy({username: 'testuser'}).exec (err)->
					if err then throw err
					User.create(userData).exec (err,newUser) ->
						if err then throw err
						user = newUser
						done()

			after (done) ->
				User.destroy({username: 'testuser'}).exec (err)->
					done(err)

			it "must persist in the database", (done) ->
				User.issueSessionToken user, (err,token) ->
					if err then throw err
					User.findOne({username: 'testuser'}).exec (err,user) ->
						if err then console.log err
						expect(user.sessionTokens).to.not.be.empty()
						expect(user.sessionTokens.length).to.be(1)
						expect(user.sessionTokens[0]).to.be(token)
						done() 

