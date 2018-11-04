const registerValidator = require('../validators/registerValidation');
const emailValidator = require('../validators/emailValidation');
const otpValidator = require('../validators/otpValidation');
const registerService = require('../services/registerService');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');

function register(req,res){
    var data = req.body;
    // validate the request data against the schema
    var valid = registerValidator.registerValidate(data);
    registerService.registerUser(valid,res);
}

function emailVerify (req, res) {
    let email = req.body.email;
    emailService.emailVerifyService(email, res);
}

function otpVerify(req, res) {
    let mobile = req.body.mobile;
    otpService.otpVerifyService(mobile, res);
}

function emailAuth(req,res){
    let data = req.body;
    let valid = emailValidator.emailValidate(data);
    emailService.emailAuthService(valid, res);
}

function otpAuth(req,res){
    let data = req.body;
    let valid = otpValidator.otpValidate(data);
    otpService.otpAuthService(valid, res);
}

module.exports = {
    register,
    emailVerify,
    otpVerify,
    emailAuth,
    otpAuth
}