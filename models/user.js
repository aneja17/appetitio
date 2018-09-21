module.exports = {
    fbDetails : {
                    first_name: '',
                    last_name: '',
                    email: '',
                    dob: '',
                    fb_social_id: '',
                    fb_access_token: '',
    }
};







// const mongoose = require('mongoose');
// const userValidater = require('mongoose-unique-validator');

// //user schema
// const UserSchema = mongoose.Schema({
//     first_name:{
//         type: String,
//         required: true
//     },
//     last_name:{
//         type: String,
//         required: true
//     },
//     email_id:{
//         type: String,
//         required: true,
//         unique: true
//     },
//     mobile:{
//         type: Number,
//         required: true,
//         unique: true
//     },
//     dob:{
//         type: Date,
//         required: true
//     },
//     pass:{
//         type: String,
//         required: true
//     },
//     address:{
//         type: String,
//         required: true
//     },
// });

// UserSchema.plugin(userValidater);
// module.exports = mongoose.model('User', UserSchema);