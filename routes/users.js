const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');

let User = require('../models/user');

//register form
router.get('/register', function(req,res){
    res.render('register');
});

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

        const data = req.body;

        // define the validation schema
        const schema = Joi.object().keys({

            first_name: Joi.string().required(),

            last_name: Joi.string().required(),
            // email is required
            // email must be a valid email string
            email_id: Joi.string().email().required(),

            // phone number is required
            // where X is a digit (0-9)
            mobile: Joi.string().length(10).required(),

            // birthday is not required
            // birthday must be a valid ISO-8601 date
            dob: Joi.date().iso(),

            pass: Joi.string().min(7).required().strict(),
            confirm_pass: Joi.string().valid(Joi.ref('pass')).required().strict(),
            address: Joi.string().required(),
        });

        // validate the request data against the schema
        var valid = Joi.validate(data, schema);
        valid.then(function(value) {
            let newUser = new User({
                first_name: value.first_name,
                last_name: value.last_name,
                email_id: value.email_id,
                mobile: value.mobile,
                dob: value.dob,
                pass: value.pass,
                address: value.address
            });

            bcrypt.genSalt(10, function(err, salt){
                bcrypt.hash(newUser.pass, salt, function(err, hash){
                    if(err){
                        console.log(err);
                    }
                    newUser.pass = hash;
                    newUser.save(function(err){
                        if(err){
                            console.log(err);
                            return;
                        } else{
                            res.redirect('/users/login');
                        }
                    });
                })
            });
        })
        .catch(function(err) {
                // send a 422 error response if validation fails
                res.status(422).json({
                    status: err,
                    message: 'Invalid request data',
                });
        });
    });

router.get('/login', function(req,res){
    res.render('login');
});

module.exports = router;