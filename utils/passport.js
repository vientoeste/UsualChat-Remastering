const passport = require('passport');
const localStrategy = require('./localStrategy');

const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.username);
  });
  passport.deserializeUser((username, done) => {
    User.findOne({ username: username }).then(user => done(null, user))
      .catch(err => done(err));
  });
  localStrategy();
}
