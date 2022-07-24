const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../utils/passport');
const User = require('../models/user');

const router = express.Router();

router.get('/login', (req, res, next) => {
  res.render('login');
})

router.post('/register', (req, res, next) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, newUser) => {
      if (err) { 
        console.log(err);
        res.redirect('/auth/login');
      } else {
        passport.authenticate('local')(req, res, () => {
        req.session.username = req.body.username;
        res.redirect('/');
        })
      }
    }
  )
})

module.exports = router;