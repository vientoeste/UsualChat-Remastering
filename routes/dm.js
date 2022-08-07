const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../utils/middlewares');
const Room = require('../models/room');
const Friend = require('../models/friend');
const Chat = require('../models/chat');
const Flag = require('../models/flag');
const User = require('../models/user');

const router = express.Router();

router.route('/')
  .post(async (req, res, next) => {
    try {
      let dmRoomID = '';
      const user = req.user.username;
      const { friend } = req.body;
      if (!friend) {
        throw new Error('there is no friend in reqbody');
      }

      const isDmExists = await Room.find({
        isDM: true,
        $or: [{
          owner: user,
          target: friend
        }, {
          owner: user,
          target: friend
        }]
      }).then((rooms) => {
        if (rooms.length === 0) {
          return false;
        } else if (rooms.length !== 1) {
          throw new Error('there is more than 2 dm rooms for 1 friend in Database');
        }
        dmRoomID = rooms[0]._id;
        return true;
      });
      console.log(dmRoomID)
      console.log(isDmExists)
      const friendID = await Friend.find({
        $or: [{
          sender: friend,
          receiver: user
        }, {
          sender: user,
          receiver: friend
        }]
      }).then((friends) => {
        if (friends.length === 0) {
          throw new Error('there is no friends in Database');       
        } else if (friends.length !== 1) {
          throw new Error('there is more than 2 same friends in Database');
        }
        return friends[0]._id;
      });
      console.log(friendID)
      if (!isDmExists) {
        const newRoom = await Room.create({
          title: 'Direct Message',
          max: 2,
          owner: user,
          isDM: true,
          target: friend
        });
        await Friend.findOneAndUpdate({
          _id: friendID
        }, {
          dm: newRoom._id
        });
        console.log(`dm 생성 - id: ${newRoom._id}`);
        res.redirect(`/room/${newRoom._id}`);
      } else {
        res.redirect(`/room/${dmRoomID}`);
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;