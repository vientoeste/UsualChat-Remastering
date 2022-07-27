const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const { isLoggedIn, isNotLoggedIn } = require('../utils/middlewares');
const User = require('../models/user');
const Friend = require('../models/friend');
const Room = require('../models/room');
const Flag = require('../models/flag');
const Chat = require('../models/chat');

const router = express.Router();

router.route('/login')
  .get(isNotLoggedIn, (req, res) => {
    res.render('login');
  })
  .post(async (req, res, next) => {
    const { username, password } = req.body;
    try{
      if (!username || !password) {
        throw new Error('there\'s no username or password on reqbody');
      }
      const userObjInDB = await User.findOne({
        username: username
      });
      if (!userObjInDB) {
        throw new Error('회원 정보가 없습니다.');
      }
      const user = new User({
        username: username,
        password: password,
      });
      req.login(user, (error) => {
        if (error) {
          throw new Error('login error');
        } else {
          passport.authenticate('local')(req, res, () => {
            req.session.username = username;
            return res.redirect('/');
          });
        }
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.route('/logout')
  .get(isLoggedIn, (req, res, next) => {
    try {
      req.logout((error) => {
        req.session.destroy();
        if (error) {
          throw new Error('There\'s something wrong with logout process');
        }
        return res.redirect('/');
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.route('/register')
  .post(isNotLoggedIn, async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new Error('there\'s no username or password on reqbody');
      }
      const userObj = await User.findOne({
        username: username,
      });
      if (!!userObj) {
        throw new Error('user already exists');
      }
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);
      const user = await User.create({
        username: username,
        password: hash,
      });
      req.login(user, (error) => {
        if (error) {
          throw new Error('login error');
        } else {
          passport.authenticate('local')(req, res, () => {
            req.session.username = username;
            return res.redirect('/');
          });
        }
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.route('/unregister')
  .get(isLoggedIn, async (req, res, next) => {
    const user = req.user.username;
    try {
      if (!user) {
        throw new Error('invalid username');
      }
      await Friend.deleteMany({
        $or: [{
          sender: user,
        }, {
          receiver: user,
        }],
      });
      await Room.deleteOne({
        owner: user,
      });
      await User.deleteOne({
        username: user,
      });
      await Chat.deleteMany({
        username: user,
      });
      await Flag.deleteMany({
        username: user,
      })
      req.session.destroy();
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;