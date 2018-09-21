const express                               = require('express');
const bodyParser                            = require('body-parser');
const mysql                                 = require('mysql');
const session                               = require('express-session');

//init app
const app                                   = express();
const db                                    = mysql.createConnection({
    host                                    : 'localhost',
    user                                    : 'root',
    password                                : 'Anmol@123',
    database                                : 'appetito_db'
  });
   
db.connect(function(err){
    if(err) throw err;
    console.log('COnencted to MySql');
});

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
    secret                                  : 'appetito',
    resave                                  : true,
    saveUninitialized                       :true,
    // cookie: { secure: true }
}));

let users = require('./routes/users');
app.use('/users', users);

//start server
app.listen(3000, function(){
    console.log('Server started at 3000');
});
module.exports                              = {
    app,
    db
};