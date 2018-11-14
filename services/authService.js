const bcrypt = require('bcryptjs');
const authValidator = require('../validators/authValidation');
const utility = require('./utilityService');

function loginUser(data, res){
    if (data.mobile) {
        let mobile = data.mobile;
        let valid = authValidator.loginValidate(data);
        valid.then(function (value) {
          let sql = 'SELECT * FROM users WHERE mobile = ?';
          let query = utility.sqlQuery(sql, [mobile]);
          query.then(function (results) {
            if (results.length <= 0) {
              res.json({
                ResponseMsg: 'User doesn\'t exists',
                ResponseFlag: 'F'
              });
            } else {
              //match password
              bcrypt.compare(value.pass, results[0].pass, function (err, isMatch) {
                if (err) {
                  res.json({
                    ResponseMsg: err,
                    ResponseFlag: 'F'
                  });
                  return;
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
                    let sql = 'INSERT INTO user_session SET ?';
                    let resMsg = 'Logged In Successfully';
                    signAndStore(value, results, sql, resMsg, res);
                  }
                }else {
                  res.json({
                    ResponseMsg: 'Password is Wrong',
                    ResponseFlag: 'F'
                  });
                }
              });
            }
          }).catch((err) => {
                res.json({
                    ResponseMsg: err,
                    ResponseFlag: 'F'
                });
          });
        }).catch((err) => {
            res.json({
                ResponseMsg: err,
                ResponseFlag: 'F'
            });
        });
    }
    else if (data.fb_social_id && data.fb_access_token) {
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
                let sql = 'SELECT * FROM users WHERE email = ?';
                let query = utility.sqlQuery(sql, [fbRes.email]);
                query.then(function (results) {
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
                        } 
                        if (results[0].is_deleted) {
                        res.json({
                            ResponseMsg: 'Your account has been deleted.',
                            ResponseFlag: 'F'
                        });
                        } else {
                        let sql = 'INSERT INTO user_session SET ?';
                        let resMsg = 'Logged In Successfully';
                        signAndStore(data, results, sql, resMsg, res);
                        }
                    }
                }).catch((err) => {
                    res.json({
                        ResponseMsg: err,
                        ResponseFlag: 'F'
                    });
                });
            });
    }
}

function signAndStore(info, results, sql, resMsg, res) {
    var user1 = {
        mobile: results[0].mobile,
        email: results[0].email,
        user_id: results[0].user_id
    }
    let obj = {
        user: user1
    }
    let logInSecret = process.env.LOGIN_SECRET;
    let expiresIn = '60s';
    let token = utility.signature(obj, logInSecret, expiresIn);
    let today = new Date();
    let days = 30;
    let expiryDate = new Date(new Date().getTime() + (days * 24 * 60 * 60 * 1000));
    let sess = {
        id_user: results[0].user_id,
        device_type: info.device_type,
        device_token: token,
        is_active: '1',
        expiry: expiryDate,
        sess_creation: today,
        sess_updation: today,
    };
    let data = [sess];
    let query = utility.sqlQuery(sql, data);
    query.then((value) => {
        res.json({
            ResponseMsg: resMsg,
            ResponseFlag: 'S',
            UserId: results[0].user_id,
            token: token
        });
    }).catch((err) => {
        res.json({
            ResponseMsg: err,
            ResponseFlag: 'F'
        });
    });
}

function changeUserPassword(valid, res){
    valid.then(function(value){
        let newPassword = {
            pass : value.password
        };
        let sql = 'UPDATE users SET ? WHERE mobile = ?';
        let data = [newPassword, value.mobile];
        let query = utility.sqlQuery(sql, data);
        query.then(function(){
            res.json({
                ResponseMsg: 'Password Updated',
                ResponseFlag: 'S'
            });
        }).catch((err) => {
            res.json({
                ResponseMsg     : err,
                ResponseFlag    : 'F'
            });
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

function logoutUser(info, res){
    let today = new Date();
    let sess = {
      fb_access_token: '',
      device_type: '0',
      device_token: '',
      is_active: '0',
      expiry: today,
      sess_updation: today,
    };
    let sql = 'UPDATE user_view SET ? WHERE email = ?';
    let data = [sess, info.email];
    let query = utility.sqlQuery(sql, data);
    query.then(function (err) {
        res.json({
          ResponseMsg: 'Logged Out',
          ResponseFlag: 'S'
        });
    }).catch((err) => {
        res.json({
            ResponseMsg: err,
            ResponseFlag: 'F'
        });
        return;
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
    loginUser,
    changeUserPassword,
    logoutUser
}