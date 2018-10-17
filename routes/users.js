const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

//register process
router.post('/register', function (req, res) {
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
            hashAndStore(newUser, res);
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
      hashAndStore(newUser, res);
    }
  })
    .catch(function (err) {
      // send a 422 error response if validation fails
      res.status(422).json({
        status: err,
        ResponseMsg: 'Invalid request data',
        ResponseFlag: 'F'
      });
    });
});

router.get('/emailverfication', function (req, res) {
  let email = req.body.email;
  let eString = emailGenerator(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  let Emaildetails = {
    reset_code: eString,
  }
  let sql = 'UPDATE users SET ? WHERE email = ?';
  let query = sqlQuery(sql, [Emaildetails, email]);
  query.then(function (err) {
    if (err) {
      res.json({
        ResponseMsg: err,
        ResponseFlag: 'F'
      });
    }
  });
});

router.post('/otpverfication', function (req, res) {
  let mobile = req.body.mobile;
  let oNumber = otpGenerator();
  let OTPdetails = {
    otp: oNumber,
    number_of_retries: 3
  }
  let sql = 'UPDATE users SET ? WHERE mobile = ?';
  let query = sqlQuery(sql, [OTPdetails, mobile]);
  query.then(function (err) {
    if (err) {
      res.json({
        ResponseMsg: err,
        ResponseFlag: 'F'
      });
    }
  });
});

router.post('/emailauthentication', function(req,res){
    let data = req.body;
    let emailAuthSchema = Joi.object().keys({
        email : Joi.string().email().required(),
        reset_code : Joi.string().alphanum().strict().required()
    });
    let valid = Joi.validate(data, emailAuthSchema);
    valid.then(function(value){
        let sql = 'SELECT reset_code FROM users WHERE email = ?';
        let query = sqlQuery(sql, [data.email]);
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
                    let query1 = sqlQuery(sql1, [setVerified, data.reset_code]);
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
});

router.post('/otpauthentication', function(req,res){
    let data = req.body;
    let otpAuthSchema = Joi.object().keys({
        mobile : Joi.number().required(),
        otp : Joi.number().strict().required()
    });
    let valid = Joi.validate(data, otpAuthSchema);
    valid.then(function(value){
        let sql = 'SELECT otp FROM users WHERE mobile = ?';
        let query = sqlQuery(sql, [data.mobile]);
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
                    let query1 = sqlQuery(sql1, [setVerified, data.otp]);
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
                    let query2 = sqlQuery(sql2, [data.otp]);
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
                                let query3 = sqlQuery(sql3, [exp, data.otp]);
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
});

router.post('/login', function (req, res) {
  if (req.body.mobile) {
    let mobile = req.body.mobile;
    const loginSchema = Joi.object().keys({
      mobile: Joi.string().length(10).required(),
      pass: Joi.string().required()
    });
    let valid = Joi.validate(req.body, loginSchema);
    valid.then(function (value) {
      let sql = 'SELECT * FROM users WHERE mobile = ?';
      let query = sqlQuery(sql, [mobile]);
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
                signAndStore(req, results);
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
          let query = sqlQuery(sql, [req.body.email]);
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
                let query = sqlQuery(sql, [req.body.fb_access_token, req.body.email]);
                query.then(function (err) {
                  if (err) {
                    res.json({
                      ResponseMsg: err,
                      ResponseFlag: 'F'
                    });
                    return;
                  } else {
                    signAndStore(req, results);
                  }
                });
              }
            }
          });
        }
      });
  }
});

router.post('/changepassword', function(req,res){
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
        let query = sqlQuery(sql, [newPassword, mobile]);
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
});


router.post('/logout', function (req, res) {
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
  let query = sqlQuery(sql, [sess, email]);
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
  // let query1 = sqlQuery(sql1, ['', email]);
  // query1.then(function(err) {
  //     if(err){
  //         res.json({
  //             message         : err
  //         });
  //         return;
  //     }
  // });
  // let sql2 = 'SELECT user_id FROM users WHERE email = ?';
  // let query2 = sqlQuery(sql2, email);
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
  //         let query3 = sqlQuery(sql3, [sess, result[0].user_id]);
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
});

//verifyToken is a middleware function
router.post('/home', verifyToken, function (req, res) {
  jwt.verify(req.token, process.env.LOGIN_SECRET, function (err, authData) {
    console.log('h');
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      res.json({
        ResponseMsg: 'Welcome..',
        ResponseFlag: 'S',
        authData: authData
      });
    }
  });
});

router.post('/fetchprofile', function(req,res){

});

router.post('/updateprofile', function(req,res){
    
});

router.post('/dish', function(req,res){
  let data = req.body;
  let today = new Date();
  let sql = 'SELECT user_id FROM users where mobile = ?';
  let query = sqlQuery(sql, [data.mobile]);
  query.then((result) => {
    let dish = {
      user_id: result[0].user_id,
      dish_name: data.dish_name,
      dish_type: data.dish_type,
      cuisine_type: data.cuisine_type,
      temperature: data.temperature,
      ingredients: data.ingredients,
      creation: today,
      updation: today
    }
    let sql1 = 'INSERT INTO owner_dishes SET ?';
    let query1 = sqlQuery(sql1, [dish]);
    query1.then(() => {
        res.json({
          ResponseMsg: 'Dish Saved Successfully',
          ResponseFlag: 'S'
        });
    }).catch(function(err) {
        res.json({
            ResponseMsg                 : err,
            ResponseFlag                : 'F'
        });
    });
  }).catch(function(err) {
    res.status(422).json({
        status                      : err,
        ResponseMsg                 : 'Invalid request data',
        ResponseFlag                : 'F'
    });
  });
});

router.post('/host', function(req,res){
  let data = req.body;
  let today = new Date();
  let host = {
    meal_time: data.meal_time,
    max_customers: data.max_customers,
    base_price: data.base_price,
    dish_id: JSON.stringify(data.dish_id),
    creation: today,
    updation: today
  }
  let sql = 'INSERT INTO hosting_view SET ?';
  let query = sqlQuery(sql, [host]);
  query.then(() => {
    res.json({
      ResponseMsg: 'Booked Successfully',
      ResponseFlag: 'S'
    });
  }).catch((err) => {
    res.json({
      ResponseMsg                 : err,
      ResponseFlag                : 'F'
    });
    return;
  });
  // let sql1 = 'SELECT event_id FROM booking WHERE meal_time = ?';
  // let query1 = sqlQuery(sql1, [data.meal_time]);
  // query1.then((result) => {
  //     let event = {
  //       event_id: result[0].event_id,
  //       dish_id: JSON.stringify(data.dish_id),
  //       creation: today,
  //       updation: today
  //     }
  //     let sql2 = 'INSERT INTO event SET ?';
  //     let query2 = sqlQuery(sql2, [event]);
  //     Promise.all([query,query2]).then(() => {
        // res.json({
        //   ResponseMsg: 'Booked Successfully',
        //   ResponseFlag: 'S'
        // });
  //     }).catch(function(err) {
  //         let q = true;
  //         while(q){
  //           let sql3 = 'DELETE FROM booking WHERE event_id = ?';
  //           let query3 = sqlQuery(sql3, [result[0].event_id]);
  //           let condition = query3.then((result) => {
  //             return result;
  //           });
  //           if(condition){
  //             q = false;
  //           }
  //         }
  //         res.json({
  //             ResponseMsg                 : err,
  //             ResponseFlag                : 'F'
  //         });
  //         return;
  //     });
  // }).catch(function(err) {
  //     res.json({
  //         ResponseMsg                 : err,
  //         ResponseFlag                : 'F'
  //     });
  //     return;
  // }); 
});

router.post('/book', function(req,res){
  let data = req.body;
  let today = new Date();
  let sql = 'SELECT user_id FROM users where mobile = ?';
  let query = sqlQuery(sql, [data.mobile]);
  query.then((result) => {
    if(data.promo_id){
      var book = {
        user_id: result[0].user_id,
        event_id: data.event_id,
        acquaintance: data.acquaintance,
        promo_id: data.promo_id,
        base_price: data.base_price,
        final_price: data.final_price,
        creation: today,
        updation: today
      }
      let sql1 = 'INSERT INTO booking_view SET ?';
      let query1 = sqlQuery(sql1, [book]);
      let promoUsed = {
        promo_redeemed: data.promo_redeemed,
        redeemed_on: today,
        updation: today
      }
      let sql2 = 'UPDATE promo_user SET ? WHERE promo_id = ?';
      let query2 = sqlQuery(sql2, [promoUsed,data.promo_id]);
      Promise.all([query1, query2]).then(() => {
        res.json({
          ResponseMsg: 'Booked Successfully',
          ResponseFlag: 'S'
        });
      }).catch(function(err) {
          res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
          });
      }); 
    }else {
      var book = {
        user_id: result[0].user_id,
        event_id: data.event_id,
        aquaintance: data.aquaintance,
        base_price: data.base_price,
        final_price: data.final_price,
        creation: today,
        updation: today
      }
      let sql1 = 'INSERT INTO booking_view SET ?';
      let query1 = sqlQuery(sql1, [book]);
      query1.then(() => {
        res.json({
          ResponseMsg: 'Booked Successfully',
          ResponseFlag: 'S'
        });
      }).catch(function(err) {
          res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
          });
      });
    }
  }).catch(function(err) {
    res.status(422).json({
        status                      : err,
        ResponseMsg                 : 'Invalid request data',
        ResponseFlag                : 'F'
    });
  });
});

router.post('booking/payment', function(req,res){
  let today = new Date();
  let data = req.body;
  let sql = 'SELECT is_paid FROM booking WHERE booking_id = ?';
  let query = sqlQuery(sql, [data.booking_id]);
  query.then((result) => {
    if(result[0].is_paid && result[0].payment_mode !== 'Cash'){
      res.json({
        ResponseMsg: 'You\'ve already paid by' + result[0].payment_mode ,
        ResponseFlag: 'S'
      });
    }else {
      let paid = {
        is_paid: '1',
        payment_mode: data.payment_mode,
        payment_time: today,
        updation: today
      }
      let sql1 = 'UPDATE booking SET ? WHERE booking_id = ?';
      let query1 = sqlQuery(sql1, [paid, data.booking_id]);
      query1.then(() => {
        res.json({
          ResponseMsg: 'Payment done Successfully',
          ResponseFlag: 'S'
        });
      }).catch(function(err) {
        res.json({
            ResponseMsg                 : err,
            ResponseFlag                : 'F'
        });
      });
    }
  }).catch((err) => {
    res.json({
      ResponseMsg                 : err,
      ResponseFlag                : 'F'
    });
  });
});

router.post('/checkin', function(req,res){
  let today = new Date();
  let data = req.body;
  let sql = 'SELECT has_checked_in FROM booking WHERE booking_id = ?';
  let query = sqlQuery(sql, [data.booking_id]);
  query.then((result) => {
    if(result[0].has_checked_in){
      res.json({
        ResponseMsg: 'You\'ve already checked in at' + result[0].checkin_time ,
        ResponseFlag: 'S'
      });
    }else {
      let checkIn = {
        has_checked_in: '1',
        checkin_time: today
      }
      let sql1 = 'UPDATE booking SET ? WHERE booking_id = ?';
      let query1 = sqlQuery(sql1, [checkIn, data.booking_id]);
      query1.then(() => {
        res.json({
          ResponseMsg: 'Checked In Successfully',
          ResponseFlag: 'S'
        });
      }).catch(function(err) {
        res.json({
            ResponseMsg                 : err,
            ResponseFlag                : 'F'
        });
      });
    }
  }).catch((err) => {
    res.json({
      ResponseMsg                 : err,
      ResponseFlag                : 'F'
    });
  });
});

router.post('/booking/cancel', function(req,res){
  let today = new Date();
  let data = req.body;
  let sql = 'SELECT is_cancelled FROM booking WHERE booking_id = ?';
  let query = sqlQuery(sql, [data.booking_id]);
  query.then((result) => {
    if(result[0].is_cancelled){
      res.json({
        ResponseMsg: 'You\'ve already cancelled' + result[0].cancellation_time ,
        ResponseFlag: 'S'
      });
    }else {
      let cancel = {
        is_cancelled: '1',
        cancellation_time: today
      }
      let sql1 = 'UPDATE booking SET ? WHERE booking_id = ?';
      let query1 = sqlQuery(sql1, [cancel, data.booking_id]);
      query1.then(() => {
        res.json({
          ResponseMsg: 'Cancelled Successfully',
          ResponseFlag: 'S'
        });
      }).catch(function(err) {
        res.json({
            ResponseMsg                 : err,
            ResponseFlag                : 'F'
        });
      });
    }
  }).catch((err) => {
    res.json({
      ResponseMsg                 : err,
      ResponseFlag                : 'F'
    });
  });
});

router.post('/dish/ratings', function(req,res){
  let today = new Date();
  let data = req.body;
  let sql = 'SELECT has_checked_in FROM booking WHERE booking_id = ?';
  let query = sqlQuery(sql, [data.booking_id]);
  query.then(() => {
    if(result[0].has_checked_in){
      let rAndC = {
        dish_rating: data.dish_rating,
        comments: data.comments,
        updation: today
      }
      let sql1 = 'UPDATE customer_event SET ? WHERE booking_id = ?';
      let query1 = sqlQuery(sql1, [rAndC, data.booking_id]);
      query1.then(() => {
        res.json({
          ResponseMsg: 'Thank You for your feedback',
          ResponseFlag: 'S'
        });
      }).catch(function(err) {
        res.json({
            ResponseMsg                 : err,
            ResponseFlag                : 'F'
        });
      });
    }
    else {
      res.json({
        ResponseMsg: 'You need to Checkin before you can rate the dish',
        ResponseFlag: 'F'
      })
    }
  }).catch((err) => {
    res.json({
      ResponseMsg                 : err,
      ResponseFlag                : 'F'
    });
  });
});

router.post('/myhostings', function(req,res){
      
});

router.post('/myvisits', function(req,res){
  
});

function emailGenerator(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * 

chars.length)];
  return result;
}

function otpGenerator() {
  var val = Math.floor(1000 + Math.random() * 9000);
  return val;
}

function signAndStore(req, results) {
  var user1 = {
    mobile: results[0].mobile,
    email: results[0].email,
    user_id: results[0].user_id
  }
  jwt.sign({user: user1}, process.env.LOGIN_SECRET, {expiresIn: '60s'}, (err, token) => {
    let today = new Date();
    let expiryDate = new Date(new Date().getTime() + (hours * 60 * 60 * 1000));
    let sess = {
      device_type: req.body.device_type,
      device_token: token,
      is_active: '1',
      expiry: expiryDate,
      creation: today,
      updation: today,
    };
    let id = results[0].user_id;
    let sql = 'INSERT INTO user_session SET ? WHERE user_id = ?';
    let query = sqlQuery(sql, [sess, id]);
    query.then(function (err) {
      if (err) {
        res.json({
          ResponseMsg: err,
          ResponseFlag: 'F'
        });
        return;
      } else {
        res.json({
          ResponseMsg: 'Logged In',
          ResponseFlag: 'S',
          UserId: id,
          token: token
        });
      }
    });
  });
}

function sqlQuery(sql, args) {
  return new Promise(function (resolve, reject) {
    db.query(sql, args, function (err, result) {
      if (err)
        return reject(err);
      resolve(result);
    });
  });
}

function hashAndStore(newUser, res) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.pass, salt, function (err, hash) {
      if (err) {
        res.json({
          ResponseMsg: err,
          ResponseFlag: 'F'
        });
      } else {
        newUser.pass = hash;
        let sql = 'INSERT INTO users SET ?';
        let query = sqlQuery(sql, [newUser]);
        query.then(function (result) {
          res.json({
            result: result,
            ResponseMsg: 'User registered Successfully',
            ResponseFlag: 'S'
          });
        });
      }
    });
  });
}

//Format of Token
//Authorization: Token <access_token>

//verify token
function verifyToken(req, res, next) {
  //get the auth header
  const tokenHeader = req.headers['authorization'];
  //check if token is undefined.
  console.log(tokenHeader);
  if (typeof tokenHeader !== 'undefined') {
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
      ResponseMsg: 'Forbidden',
      ResponseFlag: 'F'
    });
  }
}

module.exports = router;