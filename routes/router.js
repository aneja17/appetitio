const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authController = require('../controllers/authController');
const hostController = require('../controllers/hostController');
const bookController = require('../controllers/bookController');
const dataController = require('../controllers/dataController');

router.post('/register', userController.register);

router.get('/emailverfication', userController.emailVerify);

router.post('/otpverfication', userController.otpVerify);

router.post('/emailauthentication', userController.emailAuth);

router.post('/otpauthentication', userController.otpAuth);

router.post('/login', userController.login);

router.post('/changepassword', userController.changePassword);

router.post('/logout', userController.logout);

router.post('/home', authController.verifyToken, dataController.home);

router.post('/dish', hostController.saveDish);

router.post('/host', hostController.hostDishes);

router.post('/book', bookController.bookMeal);

router.post('booking/payment', bookController.bookingPayment);

router.post('/checkin', bookController.bookingCheckin);

router.post('/booking/cancel', bookController.cancelBooking);

router.post('/dish/ratings', bookController.rateDish);

router.post('/fetchprofile', function(req,res){

});

router.post('/updateprofile', function(req,res){
    
});

router.post('/myhostings', function(req,res){
      
});

router.post('/myvisits', function(req,res){
  
});

module.exports = router;