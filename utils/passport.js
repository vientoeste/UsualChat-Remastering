const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const localStrategy = require('./localStrategy');

const User = require('../models/user');

module.exports = () => {
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  localStrategy();
}
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('로그인 필요');
  }
}

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`);
  }
}
