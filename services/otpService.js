const utility = require('./utilityService');

function otpVerifyService(mobile, res){
    let oNumber = utility.numberGenerator();
    let OTPdetails = {
      otp: oNumber,
      number_of_retries: 3
    }
    let sql = 'UPDATE users SET ? WHERE mobile = ?';
    let data = [OTPdetails, mobile];
    let query = utility.sqlQuery(sql, data);
    query.then(function () {
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

function otpAuthService(valid, res){
    valid.then(function(value){
        let sql = 'SELECT otp FROM users WHERE mobile = ?';
        let query = utility.sqlQuery(sql, [value.mobile]);
        query.then(function(result){
            if(result[0].otp === value.otp){
                let setVerified = {
                    is_phone_verified : 1
                };
                let sql1 = 'UPDATE users SET ? WHERE otp = ?';
                let query1 = utility.sqlQuery(sql1, [setVerified, value.otp]);
                query1.then(() => {
                    res.json({
                        ResponseMsg: 'OTP verified',
                        ResponseFlag: 'S'
                    });
                }).catch((err) => {
                    res.json({
                        ResponseMsg     : err,
                        ResponseFlag    : 'F'
                    });
                });
            } else {
                let sql2 = 'SELECT number_of_retries FROM users WHERE otp = ?';
                let query2 = utility.sqlQuery(sql2, [result[0].otp]);
                query2.then(function(results){
                    let tried = results[0].number_of_retries;
                    if(tried > 0){
                        tried = tried-1;
                        let exp = {
                            number_of_retries: tried
                        }
                        let sql3 = 'UPDATE users SET ? WHERE otp = ?';
                        let query3 = utility.sqlQuery(sql3, [exp, result[0].otp]);
                        query3.then(() => {
                            res.json({
                                ResponseMsg: `Wrong OTP. You have ${tried} attemps left`,
                                ResponseFlag: 'F'
                            });
                        }).catch((err) => {
                            res.json({
                                ResponseMsg     : err,
                                ResponseFlag    : 'F'
                            });
                        });
                    } else {
                        res.json({
                            ResponseMsg: 'All wrong attempts. Kindly click on reset code or try again later',
                            ResponseFlag: 'F'
                        });
                    }
                }).catch((err) => {
                    res.json({
                        ResponseMsg     : err,
                        ResponseFlag    : 'F'
                    });
                });
            }
        }).catch((err) => {
            res.json({
                ResponseMsg: 'Mobile number doesn\'t exists' + err,
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
    otpVerifyService,
    otpAuthService
}