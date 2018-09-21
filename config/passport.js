var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');
var app = require('../app');
var UserSchema = require('../models/user');

// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
    clientID: configAuth.FacebookAuth.clientId,
    clientSecret:configAuth.FacebookAuth.clientSecret ,
    callbackURL: configAuth.FacebookAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      let today = new Date();
      let check = app.db.query('SELECT * FROM users WHERE email = SET ?', profile.emails[0].value);
      check.then(function(err, user){
        if(err){
            return done(err);
        } else if(user){
            return done(null, user);
        } else{
          var newUser = {
            first_name: UserSchema.fbDetails.first_name = profile.name.givenName,
            last_name: UserSchema.fbDetails.last_name = profile.name.familyName,
            email: UserSchema.fbDetails.email = profile.emails[0].value,
            dob: UserSchema.fbDetails.dob = profile.birthday,
            fb_social_id: UserSchema.fbDetails.fb_social_id = profile.id,
            fb_access_token: UserSchema.fbDetails.fb_access_token = accessToken,
            mobile: '',
            pass: '',
            latitude: '',
            longitude: '',
            address: '',
            creation: today,
            updation: today,
          };  
          let sql = 'INSERT INTO users SET ?';
          let query = app.db.query(sql, newUser);
          query.then(function(err) {
            if(err){
                throw err;
            } else{
              return done(null, newUser);
            }
          });
        }
      });
    });
  }
));

module.exports = passport;