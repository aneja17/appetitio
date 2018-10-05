require('dotenv').config({path: './env'});

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

let users = require('./routes/users');
app.use('/users', users);

//start server
app.listen(process.env.SERVER_PORT, function () {
  console.log('Server started at 3000');
});

global.db = db;