const express                               = require('express');
const router                                = express.Router();
const bcrypt                                = require('bcryptjs');
const Joi                                   = require('joi');
const jwt                                   = require('jsonwebtoken');
const User                                  = require('../models/user');
const app                                   = require('../app');

//register process
router.post('/register', function(req,res){
        var data                            = req.body;
        var today                           = new Date();

        // define the validation schema
        const schema                        = Joi.object().keys({

            first_name                      : Joi.string().required(),
            last_name                       : Joi.string().required(),
            // email is required
            // email must be a valid email string
            email                           : Joi.string().email().required(),

            // phone number is required
            // where X is a digit (0-9)
            mobile                          : Joi.number().length(10).required(),

            // birthday is not required
            // birthday must be a valid ISO-8601 date
            dob                             : Joi.date().iso(),

            pass                            : Joi.string().min(7).required().strict(),
            confirm_pass                    : Joi.string().valid(Joi.ref('pass')).required().strict(),
            latitude                        : Joi.number().min(-90).max(90).required(),
            longitude                       : Joi.number().min(-180).max(180).required(),
            address                         : Joi.string().required(),
            fb_social_id                    : Joi.number().max(15),
            fb_access_token                 : Joi.string().alphanum(),
        });
        // validate the request data against the schema
        var valid                           = Joi.validate(data, schema);
        valid.then(function(value) {
            if(value.fb_social_id && value.fb_access_token){

                const options               = {
                    method                  : 'GET',
                    uri                     : `https://graph.facebook.com/v2.8/${value.fb_social_id}`,
                    qs                      : {
                      access_token          : value.fb_access_token,
                      fields                : 'email'
                    }
                  };
                  request(options)
                    .then(fbRes => {
                      if(fbRes.email === value.email){
                        var newUser         = {
                            first_name      : value.first_name,
                            last_name       : value.last_name,
                            email           : value.email,
                            mobile          : value.mobile,
                            dob             : value.dob,
                            pass            : value.pass,
                            latitude        : value.latitude,
                            longitude       : value.longitude,
                            address         : value.address,
                            fb_social_id    : value.fb_social_id,
                            fb_access_token : value.fb_access_token,
                            creation        : today,
                            updation        : today,
                        };
                        hashAndStore(newUser, res);
                      } else {
                        res.json({
                            message         : 'Wrong fb credentials'
                        });
                        }
                    });    
            } else {
                var newUser                 = {
                    first_name              : value.first_name,
                    last_name               : value.last_name,
                    email                   : value.email,
                    mobile                  : value.mobile,
                    dob                     : value.dob,
                    pass                    : value.pass,
                    latitude                : value.latitude,
                    longitude               : value.longitude,
                    address                 : value.address,
                    creation                : today,
                    updation                : today,
                }
                hashAndStore(newUser, res);
            }
        })
        .catch(function(err) {
                // send a 422 error response if validation fails
                res.status(422).json({
                    status                  : err,
                    message                 : 'Invalid request data',
                });
        });
    });

router.post('/emailverfication', function(req,res){
    
});

router.post('/otpverfication', function(req,res){
    
});

router.post('/login', function(req,res){
    let mobile                              = req.body.mobile;
    let query                               = app.db.query('SELECT * FROM users WHERE mobile = ?', mobile);
    query.then(function(err, results){
        if(err) {
            res.json({
                message                     : err
            });
        }
        if(!results.length>0) {
            res.json({
            message                         : 'User doesn\'t exists'
            });
        } else {
            //match password
            bcrypt.compare(req.body.pass, results[0].pass, function(err, isMatch){
                if(err) {
                    res.json({
                        message             : err
                    });
                }
                if(isMatch) {
                    const user1             = {
                        mobile              : results[0].mobile,
                        email               : results[0].email
                    }
                    jwt.sign({user: user1}, 'appetitoSecret', { expiresIn: '60s'} ,(err, token) => {
                        res.json({
                            message         : 'Logged In',
                            token           : token
                        });
                    });
                    
                } else {
                    res.json({
                        message             : 'Password is Wrong'
                    });
                }
            });
        }
    });
});

//verifyToken is a middleware function
router.post('/home', verifyToken, function(req,res){
    jwt.verify(req.token, 'appetitoSecret', function(err, authData){
        console.log('h');
        if(err){
            console.log(err);
            res.sendStatus(403);
        } else {
            res.json({
                message                     : 'Welcome..',
                authData                    : authData
            });
        }
    });
});


function hashAndStore(newUser, res){
    let sql                                 = 'INSERT INTO users SET ?';
        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.pass, salt, function(err, hash){
                if(err){
                    console.log(err);
                } else{
                    newUser.pass            = hash;
                    let query               = app.db.query(sql, newUser);
                    query.then(function(err) {
                        if(err){
                            res.json({
                            message         : err
                            });
                            return;
                        } else{
                            res.json({
                                message     : 'User registered Successfully'
                            });
                        }
                    });
                }
            });
        });
}

//Format of Token
//Authorization: Token <access_token>

//verify token
function verifyToken(req, res, next){
    //get the auth header
    const tokenHeader                       = req.headers['authorization'];
    //check if token is undefined.
    console.log(tokenHeader);
    if(typeof tokenHeader !== 'undefined'){
        //split at the space
        const split                         = tokenHeader.split(' '); 
        //get token from array
        const token                         = split[1];
        //set the token
        req.token                           = token;
        console.log(token);
        //next middleware
        next();
    } else {
        //Forbidden
        res.sendStatus(403);
        res.json({
            message                         : 'Forbidden'
        });
    }
}

module.exports                              = router;