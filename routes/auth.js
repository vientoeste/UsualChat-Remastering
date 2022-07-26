const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const { isLoggedIn, isNotLoggedIn } = require('../utils/middlewares');
const User = require('../models/user');
const friend = require('../models/friend');

const router = express.Router();

router.route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post(async (req, res, next) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        next(err)
      } else {
        passport.authenticate('local')(req, res, () => {
          req.session.username = req.body.username;
          res.redirect('/');
        });
      }
    });
  });

router.route('/logout')
  .get((req, res, next) => {
    req.logout(() => {
      req.session.destroy();
      res.redirect('/');
    });
  });

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new Error({
        message: 'there\'s no username or password on reqbody'
      });
    }
    const userObj = await User.findOne({
      username: username,
    });
    if (!!userObj) {
      throw new Error({
        message: 'user already exists'
      });
    }
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    await User.create({
      username: username,
      password: hash,
    });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.route('/unregister')
  .get(async (req, res, next) => {
    try {
      const user = req.user.username;
      await friend.deleteMany({
        $or: [{
          sender: user,
        }, {
          receiver: user,
        }],
      });
      await Room.remove({
        owner: user,
      });
      await User.deleteOne({
        username: user,
      });
      req.session.destroy();
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;