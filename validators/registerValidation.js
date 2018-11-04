const Joi = require('joi');

function registerValidate(data){
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

    return Joi.validate(data, registerSchema);
}

function fbValidate(value){
    const options = {
        method: 'GET',
        uri: `https://graph.facebook.com/v2.8/${value.fb_social_id}`,
        qs: {
        access_token: value.fb_access_token,
        fields: 'email'
        }
    };
    return options;
}

module.exports = {
    registerValidate,
    fbValidate
}
