const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../utils/middlewares');
const Room = require('../models/room');
const Friend = require('../models/friend');
const Chat = require('../models/chat');
const Flag = require('../models/flag');

const router = express.Router();

router.route('/')
  .get((req, res, next) => {
    try {
      res.render('room', {
        title: 'UsualChat 채팅방 생성'
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
      const user = req.user.username;
      let { title, max, password } = req.body;
      if (!title) {
        throw new Error({
          message: 'no title on reqbody'
        });
      }
      const newRoom = await Room.create({
        title: title,
        max: max,
        owner: user,
        password: password,
        isDM: false
      });
      // 웹소켓 로직 추가 필요(socket.io -> ws)
      console.log(newRoom);
      res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.route('/dm')
  .post(async (req, res, next) => {
    try {
      let dmRoomID = '';
      const user = req.user.username;
      const { friend } = req.body;
      if (!friend) {
        throw new Error({
          message: 'there is no friend in reqbody'
        })
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
          throw new Error({
            message: 'there is more than 2 dm rooms for 1 friend in Database'
          });
        }
        dmRoomID = rooms[0]._id;
        return true;
      });
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
          throw new Error({
            message: 'there is no friends in Database'
          }) ;       
        } else if (friends.length !== 1) {
          throw new Error({
            message: 'there is more than 2 same friends in Database'
          });
        }
        return friends[0]._id;
      });
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
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  })

router.route('/:id')
  .get(async (req, res, next) => {
    const roomID = req.params.id;
    const user = req.user.username;
    try {
      const room = await Room.findOne({
        _id: roomID,
      });
      if (!room) {
        return res.redirect('/');
      }
      if (!room.password) {
        room.password = '';
      }
      if (room.password !== '' && room.password !== req.query.password) {
        return res.redirect('/?error=비밀번호가 틀렸습니다.');
      }
      // 웹소켓 -> 접속 인원 / 허용 인원 확인 필요
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
  .delete(async (req, res, next) => {
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
        await Room.remove({
          _id: roomID
        });
        await Chat.remove({
          room: roomID
        });
        await Flag.remove({
          room: roomID
        });
      }
      console.log('deleted');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.route('/room/:id/chat').post(async (req, res, next) => {
  const roomID = req.params.id;
  const user = req.user.username;
  const { chat } = req.body;
  try {
    const chatObj = await Chat.create({
      room: roomID,
      user: user,
      chat: chat,
    });
    // 웹소켓 - emit
    res.send('ok');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;