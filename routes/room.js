const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../utils/middlewares');
const Room = require('../models/room');
const Friend = require('../models/friend');
const Chat = require('../models/chat');
const Flag = require('../models/flag');

const router = express.Router();

router.route('/')
  .get(isLoggedIn, (req, res, next) => {
    try {
      res.render('room', {
        title: 'UsualChat 채팅방 생성'
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .post(isLoggedIn, async (req, res, next) => {
    try {
      const user = req.user.username;
      let { title, max, password } = req.body;
      if (!title) {
        throw new Error('no title on reqbody');
      }
      if (!password) {
        password = '';
      }
      const newRoom = await Room.create({
        title: title,
        max: max,
        owner: user,
        password: password,
        isDM: false
      });
      req.app.get('io').of('/room').emit('newRoom', newRoom);
      console.log(newRoom);
      res.redirect(`/room/${newRoom._id}?password=${password}`);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.route('/:id')
  .get(isLoggedIn, async (req, res, next) => {
    const roomID = req.params.id;
    const user = req.user.username;
    try {
      const room = await Room.findById({
        _id: roomID,
      });
      if (!room) {
        return res.redirect('/');
      }
      if (room.password !== '' && room.password !== req.query.password) {
        throw new Error('invalid pw');
      }
      const { rooms } = req.app.get('io').of('/chat').adapter;
      if ( rooms && rooms[roomID] && room.max <= rooms[roomID].length ) {
        return res.redirect('/?error=허용 인원을 초과하였습니다.');
      }
      const flag = await Flag.find({
        username: user,
        room: roomID
      }).then((items) => {
        if (items.length === 0) {
          return false;
        }
        return items[0];
      });
      let chats;
      if (!flag) {
        chats = await Chat.find({
          room: roomID,
        }).sort('createdAt');
      } else {
        chats = await Chat.find({
          room: roomID,
          createdAt: {
            $gt: flag.deletedAt
          }
        }).sort('createdAt');
      }
      res.render('chat', {
        room,
        title: room.title,
        chats,
        user: user,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .delete(isLoggedIn, async (req, res, next) => {
    const user = req.user.username;
    const roomID = req.params.id;
    try {
      const roomObj = await Room.findById({
        _id: roomID
      });
      if (!roomObj) {
        return res.redirect('/');
      }
      if (roomObj.owner === user || user === 'admin') {
        req.app.get('io').of('/room').emit('removeRoom', roomID);
        req.app.get('io').of('/chat').emit('reload');
        await Room.deleteOne({
          _id: roomID
        });
        await Chat.deleteMany({
          room: roomID
        });
        await Flag.deleteMany({
          room: roomID
        });
      }
      res.redirect(303, '/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;