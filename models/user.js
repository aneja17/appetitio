const mongoose = require('mongoose');

//user schema
const UserSchema = mongoose.Schema({
    first_name:{
        type: String,
        reuired: true
    },
    last_name:{
        type: String,
        reuired: true
    },
    email_id:{
        type: String,
        reuired: true
    },
    mobile:{
        type: Number,
        reuired: true
    },
    dob:{
        type: Date,
        reuired: true
    },
    pass:{
        type: String,
        reuired: true
    },
    address:{
        type: String,
        reuired: true
    },
});
module.exports = mongoose.model('User', UserSchema);