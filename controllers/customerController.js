const customerService = require('../services/customerService');
const utility = require('../services/utilityService');

function bookMeal(req,res){
    let info = req.body;
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);   
    Promise.all([tokenVerified, loggedIn]).then((authData) => {
        customerService.mealBooking(info, res);
    }).catch((err) => {
        res.sendStatus(403);
    });
}

function bookingPayment(req,res){
    let info = req.body;
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);   
    Promise.all([tokenVerified, loggedIn]).then((authData) => {
        customerService.payment(info, res);
    }).catch((err) => {
        res.sendStatus(403);
    });
}

function bookingCheckin(req,res){
    let info = req.body;
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);   
    Promise.all([tokenVerified, loggedIn]).then((authData) => {
        customerService.checkin(info, res);
    }).catch((err) => {
        res.sendStatus(403);
    });
}

function cancelBooking(req,res){
    let info = req.body; 
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);   
    Promise.all([tokenVerified, loggedIn]).then((authData) => { 
        customerService.cancel(info,res);
    }).catch((err) => {
        res.sendStatus(403);
    });
}

function rateDish(req,res){
    let info = req.body;
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);   
    Promise.all([tokenVerified, loggedIn]).then((authData) => {
        customerService.rate(info, res);
    }).catch((err) => {
        res.sendStatus(403);
    });
}

module.exports = {
    bookMeal,
    bookingPayment,
    bookingCheckin,
    cancelBooking,
    rateDish
}