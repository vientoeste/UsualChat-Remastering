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
      if (!!userObj) {
        const result = await bcrypt.compare(`${password}`, `${userObj.password}`);
        console.log(result)
        if (!!result) {
          done(null, userObj);
        } else {
          done(null, false, {
            message: '비밀번호가 일치하지 않습니다.'
          });
        }
      } else {
        done(null, false, {
          message: '미가입 회원입니다.'
        });
      }
    } catch (err) {
      console.error(err);
      done(err);
    }
  }));
};
