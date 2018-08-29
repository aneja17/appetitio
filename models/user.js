const mongoose = require('mongoose');

//user schema
const UserSchema = mongoose.Schema({
    first_name:{
        type: String,
        required: true
    },
    last_name:{
        type: String,
        required: true
    },
    email_id:{
        type: String,
        required: true
    },
    mobile:{
        type: Number,
        required: true
    },
    dob:{
        type: Date,
        required: true
    },
    pass:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
});
module.exports = mongoose.model('User', UserSchema);