const express = require('express');
// const { isLoggedIn, isNotLoggedIn } = require('../utils/passport');
const Room = require('../models/room');
const Friend = require('../models/friend');

const router = express.Router();

router.get('/', /*isLoggedIn,*/ async (req, res, next) => {
  try {
    const username = 'req';
    // const username = !req.session.username? req.user.username: req.session.username;
    const rooms = await Room.find({
      isDM: false
    });
    const friendRequests = await Friend.find({
      receiver: username,
      isAccepted: false
    });
    const acceptedFriends = await Friend.find({
      $or: [{
        sender: username
      }, {
        receiver: username
      }],
      isAccepted: true
    });
    res.render('main', {
      username, rooms, friendRequests, acceptedFriends, title: 'UsualChat'
    });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;