const SocketIO = require('socket.io');
const cookieParser = require('cookie-parser');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io);
  const room = io.of('/room');
  const chat = io.of('/chat');

  io.use((socket, next) => {
    cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next);
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  room.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
  });

  chat.on('connection', (socket) => {
    const req = socket.request;
    const { headers: { referer } } = req;
    const roomId = referer
      .split('/')[referer.split('/').length - 1]
      .replace(/\?.+/, '');
    socket.join(roomId);
    socket.to(roomId).emit('join', {
      user: 'system',
    });

    socket.on('disconnect', () => {
      socket.leave(roomId);
      socket.to(roomId).emit('exit', {
        user: 'system',
      });
    });

    socket.on('chat', (data) => {
      socket.to(data.room).emit(data);
    });
  });
};