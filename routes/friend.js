const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../utils/middlewares');
const Room = require('../models/room');
const Friend = require('../models/friend');
const Chat = require('../models/chat');
const Flag = require('../models/flag');
const User = require('../models/user');

const router = express.Router();

router.route('/')
  .post(isLoggedIn, async (req, res, next) => {
    const user = req.user.username;
    const { friend } = req.body;
    try {
      const friendObj = await User.findOne({
        username: friend,
      });
      if (!friendObj) {
        throw new Error('존재하지 않는 유저입니다.');
      }
      await Friend.create({
        sender: user,
        receiver: friend
      });
      res.send('ok');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.route('/:id')
  .post(isLoggedIn, async (req, res, next) => {
    const friendID = req.params.id;
    try {
      await Friend.findByIdAndUpdate({
        _id: friendID
      }, {
        isAccepted: true
      });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .delete(isLoggedIn, async (req, res, next) => {
    const friendID = req.params.id;
    try {
      await Friend.find({
        _id: friendID
      }).then(async (items) => {
        if (items.length === 0) {
          throw new Error('there\'s no such friend on DB');
        }
        await Room.findByIdAndDelete({
          _id: items[0].dm
        });
        await Chat.deleteMany({
          room: items[0].dm
        });
        await Flag.deleteMany({
          room: items[0].dm
        });
      });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;