const utility = require('./utilityService');

function mealBooking(info, res){
    let today = new Date();
    let sql = 'SELECT user_id FROM users where mobile = ?';
    let data = [info.mobile];
    let query = utility.sqlQuery(sql, data);
    query.then((result) => {
      if(info.promo_id){
        var book = {
          user_id: result[0].user_id,
          event_id: info.event_id,
          acquaintance: info.acquaintance,
          promo_id: info.promo_id,
          base_price: info.base_price,
          final_price: info.final_price,
          creation: today,
          updation: today
        }
        let sql1 = 'INSERT INTO booking_view SET ?';
        let data1 = [book];
        let query1 = utility.sqlQuery(sql1, data1);
        let promoUsed = {
          promo_redeemed: info.promo_redeemed,
          redeemed_on: today,
          updation: today
        }
        let sql2 = 'UPDATE promo_user SET ? WHERE promo_id = ?';
        let data2 = [promoUsed,info.promo_id];
        let query2 = utility.sqlQuery(sql2, data2);
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
          event_id: info.event_id,
          aquaintance: info.aquaintance,
          base_price: info.base_price,
          final_price: info.final_price,
          creation: today,
          updation: today
        }
        let sql1 = 'INSERT INTO booking_view SET ?';
        let data1 = [book];
        let query1 = utility.sqlQuery(sql1, data1);
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

function payment(info, res){
    let today = new Date();
    let sql = 'SELECT is_paid FROM booking WHERE booking_id = ?';
    let data = [info.booking_id];
    let query = utility.sqlQuery(sql, data);
    query.then((result) => {
      if(result[0].is_paid && result[0].payment_mode !== 'Cash'){
        res.json({
          ResponseMsg: 'You\'ve already paid by' + result[0].payment_mode ,
          ResponseFlag: 'S'
        });
      }else {
        let paid = {
          is_paid: '1',
          payment_mode: info.payment_mode,
          payment_time: today,
          updation: today
        }
        let sql1 = 'UPDATE booking SET ? WHERE booking_id = ?';
        let data1 = [paid, info.booking_id];
        let query1 = utility.sqlQuery(sql1, data1);
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

function checkin(info, res){
    let today = new Date();
    let sql = 'SELECT has_checked_in FROM booking WHERE booking_id = ?';
    let data = [info.booking_id];
    let query = utility.sqlQuery(sql, data);
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
        let data1 = [checkIn, info.booking_id];
        let query1 = utility.sqlQuery(sql1, data1);
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

function cancel(info, res){
    let today = new Date();
    let sql = 'SELECT is_cancelled FROM booking WHERE booking_id = ?';
    let data = [info.booking_id]
    let query = utility.sqlQuery(sql, data);
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
        let data1 = [cancel, info.booking_id]
        let query1 = utility.sqlQuery(sql1, data1);
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

function rate(info, res){
    let today = new Date();
    let sql = 'SELECT has_checked_in FROM booking WHERE booking_id = ?';
    let data = [info.booking_id];
    let query = utility.sqlQuery(sql, data);
    query.then(() => {
      if(result[0].has_checked_in){
        let rAndC = {
          dish_rating: info.dish_rating,
          comments: info.comments,
          updation: today
        }
        let sql1 = 'UPDATE customer_event SET ? WHERE booking_id = ?';
        let data1 = [rAndC, info.booking_id];
        let query1 = utility.sqlQuery(sql1, data1);
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
    mealBooking,
    payment,
    checkin,
    cancel,
    rate
}