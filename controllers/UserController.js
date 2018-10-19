const Joi = require('joi');
const bcrypt = require('bcryptjs');
const utility = require('../services/utilityService');

function register(req,res){
    var data = req.body;
    var today = new Date();

    // define the validation schema
    const registerSchema = Joi.object().keys({

        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        // email is required
        // email must be a valid email string
        email: Joi.string().email().required(),

        // phone number is required
        // where X is a digit (0-9)
        mobile: Joi.number().required(),

        // birthday is not required
        // birthday must be a valid ISO-8601 date
        dob: Joi.date().iso(),

        pass: Joi.string().min(7).strict(),
        confirm_pass: Joi.string().valid(Joi.ref('pass')).strict(),
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180),
        address: Joi.string().required(),
        fb_social_id: Joi.number().max(15),
        fb_access_token: Joi.string().alphanum(),
    });
    // validate the request data against the schema
    var valid = Joi.validate(data, registerSchema);
    valid.then(function (value) {
        if (value.fb_social_id && value.fb_access_token) {

            const options = {
                method: 'GET',
                uri: `https://graph.facebook.com/v2.8/${value.fb_social_id}`,
                qs: {
                access_token: value.fb_access_token,
                fields: 'email'
                }
            };
            request(options)
                .then(fbRes => {
                if (fbRes.email === value.email) {
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
                    fb_social_id: value.fb_social_id,
                    fb_access_token: value.fb_access_token,
                    creation: today,
                    updation: today,
                    };
                    utility.hashAndStore(newUser, res);
                } else {
                    res.json({
                    ResponseMsg: 'Wrong fb credentials',
                    ResponseFlag: 'F'
                    });
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
            utility.hashAndStore(newUser, res);
        }
    }).catch(function (err) {
        // send a 422 error response if validation fails
        res.status(422).json({
            status: err,
            ResponseMsg: 'Invalid request data',
            ResponseFlag: 'F'
        });
    });
}

function emailVerify (req, res) {
    let email = req.body.email;
    let eString = utility.emailGenerator(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    let Emaildetails = {
      reset_code: eString,
    }
    let sql = 'UPDATE users SET ? WHERE email = ?';
    let query = utility.sqlQuery(sql, [Emaildetails, email]);
    query.then(function (err) {
      if (err) {
        res.json({
          ResponseMsg: err,
          ResponseFlag: 'F'
        });
      }
    });
}

function otpVerify(req, res) {
    let mobile = req.body.mobile;
    let oNumber = utility.otpGenerator();
    let OTPdetails = {
      otp: oNumber,
      number_of_retries: 3
    }
    let sql = 'UPDATE users SET ? WHERE mobile = ?';
    let query = utility.sqlQuery(sql, [OTPdetails, mobile]);
    query.then(function (err) {
      if (err) {
        res.json({
          ResponseMsg: err,
          ResponseFlag: 'F'
        });
      }
    });
}

function emailAuth(req,res){
    let data = req.body;
    let emailAuthSchema = Joi.object().keys({
        email : Joi.string().email().required(),
        reset_code : Joi.string().alphanum().strict().required()
    });
    let valid = Joi.validate(data, emailAuthSchema);
    valid.then(function(value){
        let sql = 'SELECT reset_code FROM users WHERE email = ?';
        let query = utility.sqlQuery(sql, [data.email]);
        query.then(function(err, result){
            if(err){
                res.json({
                    ResponseMsg: 'Email doesn\'t exists',
                    ResponseFlag: 'F'
                });
            } else {
                if(result[0].reset_code === data.reset_code){
                    let setVerified = {
                        is_email_verified : 1
                    };
                    let sql1 = 'UPDATE users SET ? WHERE reset_code = ?';
                    let query1 = utility.sqlQuery(sql1, [setVerified, data.reset_code]);
                    query1.then(function(err){
                        if(err){
                            res.json({
                                ResponseMsg     : err,
                                ResponseFlag    : 'F'
                            });
                        } else {
                            res.json({
                                ResponseMsg: 'Email verified',
                                ResponseFlag: 'S'
                            });
                        }
                    });
                } else {
                    res.json({
                        ResponseMsg: 'Wrong Email Code. Try Again',
                        ResponseFlag: 'F'
                    });
                }
            }
        });
    }).catch(function(err) {
                // send a 422 error response if validation fails
                res.status(422).json({
                    status                      : err,
                    ResponseMsg                 : 'Invalid request data',
                    ResponseFlag                : 'F'
                });
        });
}

function otpAuth(req,res){
    let data = req.body;
    let otpAuthSchema = Joi.object().keys({
        mobile : Joi.number().required(),
        otp : Joi.number().strict().required()
    });
    let valid = Joi.validate(data, otpAuthSchema);
    valid.then(function(value){
        let sql = 'SELECT otp FROM users WHERE mobile = ?';
        let query = utility.sqlQuery(sql, [data.mobile]);
        query.then(function(err, result){
            if(err){
                res.json({
                    ResponseMsg: 'Mobile number doesn\'t exists',
                    ResponseFlag: 'F'
                });
            } else {
                if(result[0].otp === data.otp){
                    let setVerified = {
                        is_phone_verified : 1
                    };
                    let sql1 = 'UPDATE users SET ? WHERE otp = ?';
                    let query1 = utility.sqlQuery(sql1, [setVerified, data.otp]);
                    query1.then(function(err){
                        if(err){
                            res.json({
                                ResponseMsg     : err,
                                ResponseFlag    : 'F'
                            });
                        } else {
                            res.json({
                                ResponseMsg: 'OTP verified',
                                ResponseFlag: 'S'
                            });
                        }
                    });
                } else {
                    let sql2 = 'SELECT number_of_retries FROM users WHERE otp = ?';
                    let query2 = utility.sqlQuery(sql2, [data.otp]);
                    query2.then(function(err, result){
                        if(err){
                            res.json({
                                ResponseMsg     : err,
                                ResponseFlag    : 'F'
                            });
                        } else {
                            let tried = result[0].number_of_retries;
                            if(tried > 0){
                                tried = tried-1;
                                let exp = {
                                    number_of_retries: tried
                                }
                                let sql3 = 'UPDATE users SET ? WHERE otp = ?';
                                let query3 = utility.sqlQuery(sql3, [exp, data.otp]);
                                query3.then(function(err){
                                    if(err){
                                        res.json({
                                            ResponseMsg: err,
                                            ResponseFlag: 'F'
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    ResponseMsg: 'All wrong attempts. Kindly click on reset code or try again later',
                                    ResponseFlag: 'F'
                                });
                            }
                        }
                    });
                    res.json({
                        ResponseMsg: 'Wrong OTP. Kindly enter again',
                        ResponseFlag: 'F'
                    });
                }
            }
        });
    }).catch(function(err) {
            // send a 422 error response if validation fails
            res.status(422).json({
                status                      : err,
                ResponseMsg                 : 'Invalid request data',
                ResponseFlag                : 'F'
            });
    });
}

function login(req, res) {
    if (req.body.mobile) {
      let mobile = req.body.mobile;
      const loginSchema = Joi.object().keys({
        mobile: Joi.string().length(10).required(),
        pass: Joi.string().required()
      });
      let valid = Joi.validate(req.body, loginSchema);
      valid.then(function (value) {
        let sql = 'SELECT * FROM users WHERE mobile = ?';
        let query = utility.sqlQuery(sql, [mobile]);
        query.then(function (err, results) {
          if (err) {
            res.json({
              ResponseMsg: err,
              ResponseFlag: 'F'
            });
          }
          if (results.length <= 0) {
            res.json({
              ResponseMsg: 'User doesn\'t exists',
              ResponseFlag: 'F'
            });
          } else {
            //match password
            bcrypt.compare(req.body.pass, results[0].pass, function (err, isMatch) {
              if (err) {
                res.json({
                  ResponseMsg: err,
                  ResponseFlag: 'F'
                });
              }
              if (isMatch) {
                if (results[0].is_blocked) {
                  res.json({
                    ResponseMsg: 'You have been blocked.',
                    ResponseFlag: 'F'
                  });
                } else if (results[0].is_deleted) {
                  res.json({
                    ResponseMsg: 'Your account has been deleted.',
                    ResponseFlag: 'F'
                  });
                } else {
                  utility.signAndStore(req, results);
                }
              } else {
                res.json({
                  ResponseMsg: 'Password is Wrong',
                  ResponseFlag: 'F'
                });
              }
            });
          }
        });
      });
    }
    if (req.body.fb_social_id && req.body.fb_access_token) {
      var options = {
        method: 'GET',
        uri: `https://graph.facebook.com/v2.8/${value.fb_social_id}`,
        qs: {
          access_token: value.fb_access_token,
          fields: 'email'
        }
      };
      request(options)
        .then(fbRes => {
          if (fbRes.email === req.body.email) {
            let sql = 'SELECT * FROM users WHERE email = ?';
            let query = utility.sqlQuery(sql, [req.body.email]);
            query.then(function (err, results) {
              if (err) {
                res.json({
                  ResponseMsg: err,
                  ResponseFlag: 'F'
                });
              }
              if (!results.length > 0) {
                res.json({
                  ResponseMsg: 'User doesn\'t exists',
                  ResponseFlag: 'F'
                });
              } else {
                if (results[0].is_blocked) {
                  res.json({
                    ResponseMsg: 'You have been blocked.',
                    ResponseFlag: 'F'
                  });
                } else if (results[0].is_deleted) {
                  res.json({
                    ResponseMsg: 'Your account has been deleted.',
                    ResponseFlag: 'F'
                  });
                } else {
                  let sql = 'INSERT INTO users SET ? WHERE email = ?';
                  let query = utility.sqlQuery(sql, [req.body.fb_access_token, req.body.email]);
                  query.then(function (err) {
                    if (err) {
                      res.json({
                        ResponseMsg: err,
                        ResponseFlag: 'F'
                      });
                      return;
                    } else {
                      utility.signAndStore(req, results);
                    }
                  });
                }
              }
            });
          }
        });
    }
}

function changePassword(req,res){
    let mobile = req.body.mobile;
    let password = req.body.pass;
    let data = req.body;
    const passSchema = Joi.object().keys({
        mobile                          : Joi.number().required(),
        pass                            : Joi.string().min(7).strict(),
        confirm_pass                    : Joi.string().valid(Joi.ref('pass')).strict(),
    });

    let valid = Joi.validate(data, passSchema);
    valid.then(function(value){
        let newPassword = {
            pass : password
        };
        let sql = 'UPDATE users SET ? WHERE mobile = ?';
        let query = utility.sqlQuery(sql, [newPassword, mobile]);
        query.then(function(err){
            if(err){
                res.json({
                    ResponseMsg     : err,
                    ResponseFlag    : 'F'
                });
            } else {
                res.json({
                    ResponseMsg: 'Password Updated',
                    ResponseFlag: 'S'
                });
            }
        });
    }).catch(function(err) {
        // send a 422 error response if validation fails
        res.status(422).json({
            status                      : err,
            ResponseMsg                 : 'Invalid request data',
            ResponseFlag                : 'F'
        });
    });
}

function logout(req, res) {
    let email = req.body.email;
    let today = new Date();
    let sess = {
      fb_access_token: '',
      device_type: '0',
      device_token: '',
      is_active: '0',
      expiry: today,
      updation: today,
    };
    let sql = 'UPDATE user_view SET ? WHERE email = ?';
    let query = utility.sqlQuery(sql, [sess, email]);
    query.then(function (err) {
      if (err) {
        res.json({
          ResponseMsg: err,
          ResponseFlag: 'F'
        });
        return;
      } else {
        res.json({
          ResponseMsg: 'Logged Out',
          ResponseFlag: 'S'
        });
      }
    });
  
    // let sql1 = 'UPDATE users SET fb_access_token = ? WHERE email = ?';
    // let query1 = utility.sqlQuery(sql1, ['', email]);
    // query1.then(function(err) {
    //     if(err){
    //         res.json({
    //             message         : err
    //         });
    //         return;
    //     }
    // });
    // let sql2 = 'SELECT user_id FROM users WHERE email = ?';
    // let query2 = utility.sqlQuery(sql2, email);
    // query2.then(function(err, result){
    //     if(err){
    //         res.json({
    //             message: err
    //         });
    //         return;
    //     } else {
    //         let today                   = new Date();
    //         let sess                    = {
    //             device_type             : '0',
    //             device_token            : '',
    //             is_active               : '0',
    //             expiry                  : today,
    //             updation                : today,
    //         };
    //         let sql3 = 'UPDATE user_session SET ? WHERE user_id = ?';
    //         let query3 = utility.sqlQuery(sql3, [sess, result[0].user_id]);
    //         query3.then(function(err){
    //             if(err){
    //                 res.json({
    //                     message: err
    //                 });
    //                 return;
    //             } else {
    //                 res.json({
    //                     message         : 'Logged Out'
    //                 });
    //             }
    //         });
    //     }
    // });
}

module.exports = {
    register,
    emailVerify,
    otpVerify,
    emailAuth,
    otpAuth,
    login,
    changePassword,
    logout
}