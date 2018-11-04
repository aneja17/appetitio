const Joi = require('joi');

function emailValidate(data){
    let emailAuthSchema = Joi.object().keys({
        email : Joi.string().email().required(),
        reset_code : Joi.string().alphanum().strict().required()
    });

    return Joi.validate(data, emailAuthSchema);
}

module.exports = {
    emailValidate
}