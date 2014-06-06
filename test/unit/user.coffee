describe "User Model:", ->

  describe "Password encryption", ->

    describe "for a new user", ->
      user = null

      before (done) ->
        userData =
          username: "testuser"
          email: "testuser@sails.com"
          password: "test_password"
          passwordConfirm: "test_password"

        User.create(userData).exec (err,newUser) ->
          if err then console.log err
          user = newUser
          done()

      after (done) ->
        User.destroy({username: 'testuser'}).exec (err)->
          done(err)

      it "must encrypt the password", ->
        expect(user.password).to.be.a('string')
        expect(user.password).to.not.be('test_password')
        expect(user).to.not.have.property('passwordConfirm')
        # user.must.not.have.property('passwordConfirmation');