const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();

const connect = require('./models');
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');
const friendRouter = require('./routes/friend');
const chatRouter = require('./routes/chat')
const passportConfig = require('./utils/passport');
const webSocket = require('./socket');

const app = express();
passportConfig();

app.set('view engine', 'njk');

nunjucks.configure('views', {
  express: app,
  watch: true,
});
const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

connect();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'views')))
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use('/file', express.static(path.join(__dirname, 'uploads')));
app.use('/views', express.static(path.join(__dirname + 'views')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', mainRouter);
app.use('/auth', authRouter);
app.use('/room/:id', chatRouter)
app.use('/room', roomRouter);
app.use('/friend', friendRouter);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = err;
  res.status(err.status || 500);
  if (err.message.slice(0, 7) === 'Cast to') {
    res.redirect('/?error=방 주소 형식이 잘못되었습니다.');
  } else if (req.url === '/auth/register') {
    res.redirect('/auth/login?error=이미 존재하는 닉네임입니다.')
  } else if (err.message.slice(-10) === '라우터가 없습니다.') {
    res.send(err.message);
  } else if (err.message === 'invalid pw') {
    res.redirect('/?error=비밀번호가 틀렸습니다.')
  } else if (err.message.slice(0, 6) === 'Cannot') {
    res.redirect('/')
  } else {
    res.redirect(`${req.url}/?error=${err.message}`);
  }
});

const server = app.listen(process.env.PORT, () => {
    console.log(process.env.PORT);
});

webSocket(server, app, sessionMiddleware);