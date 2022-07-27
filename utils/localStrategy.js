const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  }, async (username, password, done) => {
    try {
      const userObj = await User.findOne({ username: username });
      console.log(userObj)
      if (!userObj) {
        done(null, false, {
          message: '미가입 회원입니다.'
        });
      }
      const result = await bcrypt.compare(`${password}`, `${userObj.password}`);
      if (!result) {
        done(null, false, {
          message: '비밀번호가 일치하지 않습니다.'
        });
      } else {
        done(null, userObj);
      }
    } catch (err) {
      console.error(err);
      done(err);
    }
  }));
};
