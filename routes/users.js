const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

let User = require('../models/user');

//register form
router.get('/register', function(req,res){
    res.render('register');
});

//register process
router.post('/register', function(req,res){
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email_id = req.body.email_id;
    const mobile = req.body.mobile;
    const dob = req.body.dob;
    const pass = req.body.pass;
    const confirm_pass = req.body.confirm_pass;
    const address = req.body.address;

    req.checkBody('first_name', 'First Name is required').notEmpty();
    req.checkBody('last_name', 'Last Name is required').notEmpty();
    req.checkBody('email_id', 'Email is required').notEmpty();
    req.checkBody('email_id', 'Email is not valid').isEmail();
    req.checkBody('mobile', 'Mobile Number is required').notEmpty();
    req.checkBody('mobile', 'Mobile Number  is not valid').isNumeric(10);
    req.checkBody('dob', 'Date of Birth is required').notEmpty();
    req.checkBody('pass', 'Password is required').notEmpty();
    req.checkBody('confirm_pass', 'Passwords do not match').equals(req.body.pass);
    req.checkBody('address', 'Address is required').notEmpty();

    let errors = req.validationErrors();

    if(errors){
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new User({
            first_name: first_name,
            last_name: last_name,
            email_id: email_id,
            mobile: mobile,
            dob: dob,
            pass: pass,
            address: address
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
    }
});

router.get('/login', function(req,res){
    res.render('login');
});

module.exports = router;