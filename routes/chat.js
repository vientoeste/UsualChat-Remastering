const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../utils/middlewares');
const Room = require('../models/room');
const Friend = require('../models/friend');
const Chat = require('../models/chat');
const Flag = require('../models/flag');
const multer = require('multer');

const router = express.Router();

router.route('/chat')
  .post(isLoggedIn, async (req, res, next) => {
    const roomID = req.originalUrl.slice(6, -5);
    const user = req.user.username;
    const { chat } = req.body;
    try {
      const chatObj = await Chat.create({
        room: roomID,
        user: user,
        chat: chat,
      });
      req.app.get('io').of('/chat').to(roomID).emit('chat', chatObj);
      res.send('ok');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.route('/img')
  .post(isLoggedIn, async (req, res, next) => {
    const roomID = req.originalUrl.slice(6, -5);
    const user = req.user.username;

  });

router.route('/file')
  .post(isLoggedIn, async (req, res, next) => {
    const roomID = req.originalUrl.slice(6, -5);
    const user = req.user.username;

  });
  
module.exports = router;