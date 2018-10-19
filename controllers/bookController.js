const utility = require('../services/utilityService');

function bookMeal(req,res){
    let data = req.body;
    let today = new Date();
    let sql = 'SELECT user_id FROM users where mobile = ?';
    let query = utility.sqlQuery(sql, [data.mobile]);
    query.then((result) => {
      if(data.promo_id){
        var book = {
          user_id: result[0].user_id,
          event_id: data.event_id,
          acquaintance: data.acquaintance,
          promo_id: data.promo_id,
          base_price: data.base_price,
          final_price: data.final_price,
          creation: today,
          updation: today
        }
        let sql1 = 'INSERT INTO booking_view SET ?';
        let query1 = utility.sqlQuery(sql1, [book]);
        let promoUsed = {
          promo_redeemed: data.promo_redeemed,
          redeemed_on: today,
          updation: today
        }
        let sql2 = 'UPDATE promo_user SET ? WHERE promo_id = ?';
        let query2 = utility.sqlQuery(sql2, [promoUsed,data.promo_id]);
        Promise.all([query1, query2]).then(() => {
          res.json({
            ResponseMsg: 'Booked Successfully',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
            res.json({
                ResponseMsg                 : err,
                ResponseFlag                : 'F'
            });
        }); 
      }else {
        var book = {
          user_id: result[0].user_id,
          event_id: data.event_id,
          aquaintance: data.aquaintance,
          base_price: data.base_price,
          final_price: data.final_price,
          creation: today,
          updation: today
        }
        let sql1 = 'INSERT INTO booking_view SET ?';
        let query1 = utility.sqlQuery(sql1, [book]);
        query1.then(() => {
          res.json({
            ResponseMsg: 'Booked Successfully',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
            res.json({
                ResponseMsg                 : err,
                ResponseFlag                : 'F'
            });
        });
      }
    }).catch(function(err) {
      res.status(422).json({
          status                      : err,
          ResponseMsg                 : 'Invalid request data',
          ResponseFlag                : 'F'
      });
    });
}

function bookingPayment(req,res){
    let today = new Date();
    let data = req.body;
    let sql = 'SELECT is_paid FROM booking WHERE booking_id = ?';
    let query = utility.sqlQuery(sql, [data.booking_id]);
    query.then((result) => {
      if(result[0].is_paid && result[0].payment_mode !== 'Cash'){
        res.json({
          ResponseMsg: 'You\'ve already paid by' + result[0].payment_mode ,
          ResponseFlag: 'S'
        });
      }else {
        let paid = {
          is_paid: '1',
          payment_mode: data.payment_mode,
          payment_time: today,
          updation: today
        }
        let sql1 = 'UPDATE booking SET ? WHERE booking_id = ?';
        let query1 = utility.sqlQuery(sql1, [paid, data.booking_id]);
        query1.then(() => {
          res.json({
            ResponseMsg: 'Payment done Successfully',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
          res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
          });
        });
      }
    }).catch((err) => {
      res.json({
        ResponseMsg                 : err,
        ResponseFlag                : 'F'
      });
    });
}

function bookingCheckin(req,res){
    let today = new Date();
    let data = req.body;
    let sql = 'SELECT has_checked_in FROM booking WHERE booking_id = ?';
    let query = utility.sqlQuery(sql, [data.booking_id]);
    query.then((result) => {
      if(result[0].has_checked_in){
        res.json({
          ResponseMsg: 'You\'ve already checked in at' + result[0].checkin_time ,
          ResponseFlag: 'S'
        });
      }else {
        let checkIn = {
          has_checked_in: '1',
          checkin_time: today
        }
        let sql1 = 'UPDATE booking SET ? WHERE booking_id = ?';
        let query1 = utility.sqlQuery(sql1, [checkIn, data.booking_id]);
        query1.then(() => {
          res.json({
            ResponseMsg: 'Checked In Successfully',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
          res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
          });
        });
      }
    }).catch((err) => {
      res.json({
        ResponseMsg                 : err,
        ResponseFlag                : 'F'
      });
    });
}

function cancelBooking(req,res){
    let today = new Date();
    let data = req.body;
    let sql = 'SELECT is_cancelled FROM booking WHERE booking_id = ?';
    let query = utility.sqlQuery(sql, [data.booking_id]);
    query.then((result) => {
      if(result[0].is_cancelled){
        res.json({
          ResponseMsg: 'You\'ve already cancelled' + result[0].cancellation_time ,
          ResponseFlag: 'S'
        });
      }else {
        let cancel = {
          is_cancelled: '1',
          cancellation_time: today
        }
        let sql1 = 'UPDATE booking SET ? WHERE booking_id = ?';
        let query1 = utility.sqlQuery(sql1, [cancel, data.booking_id]);
        query1.then(() => {
          res.json({
            ResponseMsg: 'Booking Cancelled Successfully',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
          res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
          });
        });
      }
    }).catch((err) => {
      res.json({
        ResponseMsg                 : err,
        ResponseFlag                : 'F'
      });
    });
}

function rateDish(req,res){
    let today = new Date();
    let data = req.body;
    let sql = 'SELECT has_checked_in FROM booking WHERE booking_id = ?';
    let query = utility.sqlQuery(sql, [data.booking_id]);
    query.then(() => {
      if(result[0].has_checked_in){
        let rAndC = {
          dish_rating: data.dish_rating,
          comments: data.comments,
          updation: today
        }
        let sql1 = 'UPDATE customer_event SET ? WHERE booking_id = ?';
        let query1 = utility.sqlQuery(sql1, [rAndC, data.booking_id]);
        query1.then(() => {
          res.json({
            ResponseMsg: 'Thank You for your feedback',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
          res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
          });
        });
      }
      else {
        res.json({
          ResponseMsg: 'You need to Checkin before you can rate the dish',
          ResponseFlag: 'F'
        })
      }
    }).catch((err) => {
      res.json({
        ResponseMsg                 : err,
        ResponseFlag                : 'F'
      });
    });
}

module.exports = {
    bookMeal,
    bookingPayment,
    bookingCheckin,
    cancelBooking,
    rateDish
}