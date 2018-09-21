const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const app = require('../app');
const passport = require('../config/passport');

// //register form
// router.get('/register', function(req,res){
//     res.render('register');
// });

//register process
router.post('/register', function(req,res){
        // const first_name = req.body.first_name;
        // const last_name = req.body.last_name;
        // const email_id = req.body.email_id;
        // const mobile = req.body.mobile;
        // const dob = req.body.dob;
        // const pass = req.body.pass;
        // const confirm_pass = req.body.confirm_pass;
        // const address = req.body.address;

        // req.checkBody('first_name', 'First Name is required').notEmpty();
        // req.checkBody('last_name', 'Last Name is required').notEmpty();
        // req.checkBody('email_id', 'Email is required').notEmpty();
        // req.checkBody('email_id', 'Email is not valid').isEmail();
        // req.checkBody('mobile', 'Mobile Number is required').notEmpty();
        // req.checkBody('mobile', 'Mobile Number  is not valid').isNumeric(10);
        // req.checkBody('dob', 'Date of Birth is required').notEmpty();
        // req.checkBody('pass', 'Password is required').notEmpty();
        // req.checkBody('confirm_pass', 'Passwords do not match').equals(req.body.pass);
        // req.checkBody('address', 'Address is required').notEmpty();

        // let errors = req.validationErrors();

        var data = req.body;
        var today = new Date();

        // define the validation schema
        const schema = Joi.object().keys({

            first_name: Joi.string().required(),

            last_name: Joi.string().required(),
            // email is required
            // email must be a valid email string
            email: Joi.string().email().required(),

            // phone number is required
            // where X is a digit (0-9)
            mobile: Joi.number().length(10).required(),

            // birthday is not required
            // birthday must be a valid ISO-8601 date
            dob: Joi.date().iso(),

            pass: Joi.string().min(7).required().strict(),
            confirm_pass: Joi.string().valid(Joi.ref('pass')).required().strict(),
            latitude: Joi.number().min(-90).max(90).required(),
            longitude: Joi.number().min(-180).max(180).required(),
            address: Joi.string().required(),
            fb_social_id: Joi.number().max(15),
            fb_access_token: Joi.string().alphanum(),
        });
        // validate the request data against the schema
        var valid = Joi.validate(data, schema);
        valid.then(function(value) {
            if(value.fb_social_id && value.fb_access_token){
                let check = app.db.query('SELECT * FROM users WHERE fb_social_id = SET ?', value.fb_social_id);
                check.then(function(err, user){
                    if(err){
                        throw err;
                    } else if(user){
                        if(user.fb_access_token === value.fb_access_token){
                            var User = {
                                first_name: value.first_name,
                                last_name: value.last_name,
                                email: value.email,
                                mobile: value.mobile,
                                dob: value.dob,
                                pass: value.pass,
                                latitude: value.latitude,
                                longitude: value.longitude,
                                address: value.address,
                                fb_social_id: value.fb_social_id,
                                fb_access_token: value.fb_access_token,
                                creation: today,
                                updation: today,
                            };
                            bcrypt.genSalt(10, function(err, salt){
                                bcrypt.hash(User.pass, salt, function(err, hash){
                                    if(err){
                                        console.log(err);
                                    } else{
                                        User.pass = hash;
                                        let query = app.db.query('UPDATE users SET ? WHERE fb_social_id = :fb_social_id', User);
                                        query.then(function(err) {
                                            if(err){
                                                res.json({
                                                message: err
                                                });
                                                return;
                                            } else{
                                                res.json({
                                                    message: 'User details updated'
                                                });
                                            }
                
                                        });
                                        // newUser.save(function(err){
                                        //     if(err){
                                        //         res.json({
                                        //             message: err
                                        //         });
                                        //         return;
                                        //     } else{
                                        //         res.redirect('/users/login');
                                        //     }
                                        // });
                                    }
                                });
                            });
                        } else {
                            res.json({
                                message: 'Wrong fb credentials'
                            });
                        }
                    }
                });    
            } else {
                var newUser = {
                    first_name: value.first_name,
                    last_name: value.last_name,
                    email: value.email,
                    mobile: value.mobile,
                    dob: value.dob,
                    pass: value.pass,
                    latitude: value.latitude,
                    longitude: value.longitude,
                    address: value.address,
                    creation: today,
                    updation: today,
                }
            let sql = 'INSERT INTO users SET ?';

            bcrypt.genSalt(10, function(err, salt){
                bcrypt.hash(newUser.pass, salt, function(err, hash){
                    if(err){
                        console.log(err);
                    } else{
                        newUser.pass = hash;
                        let query = app.db.query(sql, newUser);
                        query.then(function(err) {
                            if(err){
                                res.json({
                                message: err
                                });
                                return;
                            } else{
                                res.json({
                                    message: 'User registered Successfully'
                                });
                            }

                        });
                        // newUser.save(function(err){
                        //     if(err){
                        //         res.json({
                        //             message: err
                        //         });
                        //         return;
                        //     } else{
                        //         res.redirect('/users/login');
                        //     }
                        // });
                    }
                });
            });
            }
        })
        .catch(function(err) {
                // send a 422 error response if validation fails
                res.status(422).json({
                    status: err,
                    message: 'Invalid request data',
                });
        });
    });
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook', passport.authenticate('facebook', { 
    scope : ['public_profile', 'email', 'birthday']
  }));
// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { 
        successRedirect : '/register', 
        failureRedirect: '/register' 
    }),
    function(req, res) {
        res.json({
            first_name: User.fbDetails.first_name,
            last_name: User.fbDetails.last_name,
            email: User.fbDetails.email,
            dob: User.fbDetails.dob,
            fb_social_id: User.fbDetails.fb_social_id,
            fb_access_token: User.fbDetails.fb_access_token,
        });
    });

router.post('/emailverfication', function(req,res){
    
});

router.post('/otpverfication', function(req,res){
    
});
// router.get('/login', function(req,res){
//     res.render('login');
// });

router.post('/login', function(req,res){
    // const query = {mobile: req.body.mobile};
    // User.findOne(query, function(err, user){
        // if(err) {
        //     res.json({
        //         message: err
        //     });
        // }
        // if(!user) {
        //     res.json({
        //     message: 'User doesn\'t exists'
        //     });
        // } else {
        //     //match password
        //     bcrypt.compare(req.body.pass, user.pass, function(err, isMatch){
        //         if(err) {
        //             res.json({
        //                 message: err
        //             });
        //         }
        //         if(isMatch) {
        //             const user1 = {
        //                 mobile: user.mobile,
        //                 email_id: user.email_id
        //             }
        //             jwt.sign({user: user1}, 'appetitoSecret', { expiresIn: '60s'} ,(err, token) => {
        //                 res.json({
        //                     message: 'Logged In',
        //                     token: token
        //                 });
        //             });
                    
        //         } else {
        //             res.json({
        //                 message: 'Password is Wrong'
        //             });
        //         }
        //     });
        // }
    // });
    let mobile = req.body.mobile;
    let query = app.db.query('SELECT * FROM users WHERE mobile = ?', mobile);
    query.then(function(err, results){
        if(err) {
            res.json({
                message: err
            });
        }
        if(!results.length>0) {
            res.json({
            message: 'User doesn\'t exists'
            });
        } else {
            //match password
            bcrypt.compare(req.body.pass, results[0].pass, function(err, isMatch){
                if(err) {
                    res.json({
                        message: err
                    });
                }
                if(isMatch) {
                    const user1 = {
                        mobile: results[0].mobile,
                        email: results[0].email
                    }
                    jwt.sign({user: user1}, 'appetitoSecret', { expiresIn: '60s'} ,(err, token) => {
                        res.json({
                            message: 'Logged In',
                            token: token
                        });
                    });
                    
                } else {
                    res.json({
                        message: 'Password is Wrong'
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
                message: 'Welcome..',
                authData: authData
            });
        }
    });
});

//Format of Token
//Authorization: Token <access_token>

//verify token
function verifyToken(req, res, next){
    //get the auth header
    const tokenHeader = req.headers['authorization'];
    //check if token is undefined.
    console.log(tokenHeader);
    if(typeof tokenHeader !== 'undefined'){
        //split at the space
        const split = tokenHeader.split(' '); 
        //get token from array
        const token = split[1];
        //set the token
        req.token = token;
        console.log(token);
        //next middleware
        next();
    } else {
        //Forbidden
        res.sendStatus(403);
        res.json({
            message: 'Forbidden'
        });
    }
}

module.exports = router;