const utility = require('./utilityService');

function emailVerifyService(email, res){
    let eString = utility.stringGenerator(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    let Emaildetails = {
      reset_code: eString,
    }
    let sql = 'UPDATE users SET ? WHERE email = ?';
    let query = utility.sqlQuery(sql, [Emaildetails, email]);
    query.then(function (err) {
        res.json({
            ResponseFlag: 'S'
        });
    }).catch((err) => {
        res.json({
            ResponseMsg: err,
            ResponseFlag: 'F'
          });
    });
}

function emailAuthService(valid, res){
    valid.then(function(value){
        let sql = 'SELECT reset_code FROM users WHERE email = ?';
        let query = utility.sqlQuery(sql, [value.email]);
        query.then(function(result){
            if(result[0].reset_code === value.reset_code){
                let setVerified = {
                    is_email_verified : 1
                };
                let sql1 = 'UPDATE users SET ? WHERE reset_code = ?';
                let query1 = utility.sqlQuery(sql1, [setVerified, value.reset_code]);
                query1.then(function(){
                    res.json({
                        ResponseMsg: 'Email verified',
                        ResponseFlag: 'S'
                    });
                }).catch((err) => {
                    res.json({
                        ResponseMsg: err,
                        ResponseFlag: 'F'
                      });
                });
            } else {
                res.json({
                    ResponseMsg: 'Wrong Email Code. Try Again',
                    ResponseFlag: 'F'
                });
            }
        }).catch((err) => {
            res.json({
                ResponseMsg: err,
                ResponseFlag: 'F'
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

module.exports = {
    emailVerifyService,
    emailAuthService
}