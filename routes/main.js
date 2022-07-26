const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../utils/middlewares');
const Room = require('../models/room');
const Friend = require('../models/friend');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    const user = req.user.username;
    const rooms = await Room.find({
      isDM: false
    });
    const friendRequests = await Friend.find({
      receiver: user,
      isAccepted: false
    });
    const acceptedFriends = await Friend.find({
      $or: [{
        sender: user
      }, {
        receiver: user
      }],
      isAccepted: true
    });
    res.render('main', {
      user, rooms, friendRequests, acceptedFriends, title: 'UsualChat'
    });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;