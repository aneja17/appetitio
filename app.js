const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, './.env')});

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
//init app
const app = express();

require('./database/db');

//body-parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//express session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}));

require('./config/winston');

let taskScheduler = require('./scheduler');
taskScheduler.task.start();

let regRouter = require('./routes/registration');
app.use('/users', regRouter);

let loginRouter = require('./routes/auth');
app.use('/users', loginRouter);

let userRouter = require('./routes/user');
app.use('/users', userRouter);

let hostRouter = require('./routes/host');
app.use('/users', hostRouter);

let customerRouter = require('./routes/customer');
app.use('/users', customerRouter);

//start server
app.listen(process.env.SERVER_PORT, function () {
  logger.log({
    level : 'info',
    message : 'Server Started'
  });
  console.log(`Server started at ${process.env.SERVER_PORT}`);
});