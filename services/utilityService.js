const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function emailGenerator(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
  
function otpGenerator() {
    var val = Math.floor(1000 + Math.random() * 9000);
    return val;
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

module.exports = {
    emailGenerator,
    otpGenerator,
    sqlQuery,
    hashAndStore,
    signAndStore
}