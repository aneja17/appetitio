const registerValidator = require('../validators/registerValidation');
const utility = require('./utilityService');

let today = new Date();
function registerUser(valid,res){
    valid.then(function (value) {
        if (value.fb_social_id && value.fb_access_token) {
            const options = registerValidator.fbValidate(value);
            request(options)
                .then(fbRes => {
                registerFbUser(fbRes, value, res);
            });
        } else {
            registerNewUser(value, res);
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
function registerFbUser(fbRes, value, res){
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
        let sql = 'INSERT INTO users SET ?';
        let resMsg = 'User registered Successfully';
        utility.hashAndStore(sql, newUser, resMsg, res);
    } else {
        res.json({
        ResponseMsg: 'Wrong fb credentials',
        ResponseFlag: 'F'
        });
    }
}

function registerNewUser(value, res){
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
    let resMsg = 'User registered Successfully';
    utility.hashAndStore(sql, newUser, resMsg, res);
}

module.exports = {
    registerUser
}