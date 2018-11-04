require('dotenv').config({path: 'C:\\Users\\lappy\\Api\\nodekb\\.env'});

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
//init app
const app = express();
let db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(function (err) {
  if (err) throw err;
  console.log('Connected to MySql');
});

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

let regRouter = require('./routes/registration');
app.use('/users', regRouter);

let loginRouter = require('./routes/login');
app.use('/users', loginRouter);

let userRouter = require('./routes/user');
app.use('/users', userRouter);

let hostRouter = require('./routes/host');
app.use('/users', hostRouter);

let customerRouter = require('./routes/customer');
app.use('/users', customerRouter);

//start server
app.listen(process.env.SERVER_PORT, function () {
  console.log('Server started at 3000');
});

global.db = db;