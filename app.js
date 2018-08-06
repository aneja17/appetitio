const express = require('express');
const bodyParser = require('body-parser')
//path is core module included in nodejs
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
//connect database to mongoose
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;
//init app
const app = express();

//check db connection
db.once('open', function(){
    console.log('Connected to MongoDB');
})
//check for database errors
db.on('error', function(err){
    console.log(err);
});

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
    secret: 'appetito',
    resave: true,
    saveUninitialized:true,
    // cookie: { secure: true }
}));

//express messages middleware
// app.use(flash());
// app.use(function(req,res,next){
//     res.locals.messages = require('express-messages')(req,res);
//     next();
// });

//express validator middleware
app.use(expressValidator({
    errorFormatter: function(param,msg,value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

let users = require('./routes/users')
app.use('/users', users);

//start server
app.listen(3000, function(){
    console.log('Server started at 3000');
});
module.exports = app;