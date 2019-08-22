'use strict'

const User = use('App/Models/User');
const atob = require('atob');

class UserController {

  // Register a new user
  async signup({
    request,
    response,
    auth,
    session
  }) {
    const data = request.only(['firstname', 'email', 'password']);
    const user = await User.create({
      email: data.email,
      password: data.password,
      username: data.firstname
    });
    const token = await auth.generate(user)

    return response.send({
      "message": "Successfully created account",
      "token": token.token
    });
  }

  // Login using an existing user
  async login({
    request,
    response,
    auth
  }) {
    const authHeader = atob(request.header('Authorization')).split(':');

    let user = (await User.query().where('email', authHeader[0]).limit(1).fetch()).toJSON();
    if (!user[0] || !user[0].email) {
      return response.status(401).send({
        "message": "User credentials not valid",
        "code": "invalid-credentials",
        "status": 401
      });
    }

    let token;
    try {
      // TODO: Login is currently not working as the password is incorrect
      token = await auth.attempt(user[0].id, authHeader[1])
    } catch (e) {
      return response.status(401).send({
        "message": "User credentials not valid",
        "code": "invalid-credentials",
        "status": 401
      });
    }

    return response.send({
      "message": "Successfully logged in",
      "token": token.token
    });
  }

  // Return information about the current user
  async me({
    request,
    response,
    auth,
    session
  }) {
    try {
      await auth.getUser()
    } catch (error) {
      response.send('Missing or invalid api token')
    }

    return response.send({
      accountType: "individual",
      beta: false,
      donor: {},
      email: auth.user.email,
      emailValidated: true,
      features: {},
      firstname: "Franz",
      id: "2acd2aa0-0869-4a91-adab-f700ac256dbe",
      isPremium: true,
      isSubscriptionOwner: true,
      lastname: "Franz",
      locale: "en-US"
    });
  }
}

module.exports = UserController