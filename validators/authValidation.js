const Joi = require('joi');

function loginValidate(data){
    const loginSchema = Joi.object().keys({
        mobile: Joi.number().required(),
        pass: Joi.string().min(7).strict().required(),
        device_type: Joi.number().required()
      });
    return Joi.validate(data, loginSchema);
}

function changePasswordValidate(data){
    const passSchema = Joi.object().keys({
        mobile                          : Joi.number().required(),
        pass                            : Joi.string().min(7).strict(),
        confirm_pass                    : Joi.string().valid(Joi.ref('pass')).strict(),
    });
    return Joi.validate(data, passSchema);
}

function logoutValidate(data){
    const passSchema = Joi.object().keys({
        mobile                          : Joi.number().required(),
    });
    return Joi.validate(data, passSchema);
}

module.exports = {
    loginValidate,
    changePasswordValidate,
    logoutValidate
}