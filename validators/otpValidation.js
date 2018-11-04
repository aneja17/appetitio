const Joi = require('joi');

function otpValidate(data){
    let otpAuthSchema = Joi.object().keys({
        mobile : Joi.number().required(),
        otp : Joi.number().strict().required()
    });

    return Joi.validate(data, otpAuthSchema);
}

module.exports = {
    otpValidate
}