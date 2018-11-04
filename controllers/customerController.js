const customerService = require('../services/customerService');

function bookMeal(req,res){
    let info = req.body;
    customerService.mealBooking(info, res);
}

function bookingPayment(req,res){
    let info = req.body;
    customerService.payment(info, res);
}

function bookingCheckin(req,res){
    let info = req.body;
    customerService.checkin(info, res);
}

function cancelBooking(req,res){
    let info = req.body;  
    customerService.cancel(info,res);
}

function rateDish(req,res){
    let info = req.body;
    customerService.rate(info, res);
}

module.exports = {
    bookMeal,
    bookingPayment,
    bookingCheckin,
    cancelBooking,
    rateDish
}