const utility = require('./utilityService');

function promoCheck(info, res){
  let now = new Date();
  let sql = 'SELECT promo_id, promo_code FROM promo_user WHERE user_id = (SELECT user_id FROM users where mobile = ?) and promo_expiry > ?';
  let data = [info.mobile, now];
  let query = utility.sqlQuery(sql, data);
  query.then((result) => {
    result.forEach(element => {
      if(element.promo_code == info.promo_code){
        res.json({
          ResponseMsg : 'Promo Applied',
          promo_id : element.promo_id,
          ResponseFlag : 'S'
        });
      }else {
        res.json({
          ResponseMsg : 'Promo Doesn\'t exist',
          ResponseFlag : 'F'
        });
      }
    });
  }).catch((err) => {
    res.json({
      ResponseMsg : err,
      ResponseFlag : 'F'
    })
  });
}

function mealBooking(info, res){
  let today = new Date();
  let sql = 'SELECT user_id FROM users where mobile = ?';
  let data = [info.mobile];
  let query = utility.sqlQuery(sql, data);
  query.then((result) => {
    if(info.promo_id){
      var book1 = {
        customer_id: result[0].user_id,
        aquaintance: info.aquaintance,
        promo_id: info.promo_id,
        base_price: info.base_price,
        final_price: info.final_price,
        booking_creation: today,
        booking_updation: today
      }
      let sql1 = 'INSERT INTO booking_customer SET ?';
      let data1 = [book1];
      let query1 = utility.sqlQuery(sql1, data1);
      let sql = 'SELECT MAX(booking_id) FROM booking_customer WHERE customer_id = ?';
      let data = [result[0].user_id];
      let query = utility.sqlQuery(sql, data);
      query.then((resp) => {
        var book2 = {
          event_id: info.event_id,
          id_booking: resp[0].booking_id,
          event_creation: today,
          event_updation: today
        }
        let sql2 = 'INSERT INTO customer_event SET ?';
        let data2 = [book2];
        let query2 = utility.sqlQuery(sql2, data2);
        let promoUsed = {
          promo_redeemed: 1,
          redeemed_on: today,
          updation: today
        }
        let sql3 = 'UPDATE promo_user SET ? WHERE promo_id = ?';
        let data3 = [promoUsed,info.promo_id];
        let query3 = utility.sqlQuery(sql3, data3);
        Promise.all([query2, query3]).then(() => {
          res.json({
            ResponseMsg: 'Booked Successfully',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
          let sql4 = 'DELETE booking_customer, customer_event FROM booking_customer INNER JOIN customer_event WHERE booking_customer.booking_id = customer_event.id_booking and booking_customer.booking_id = ?';
          let data4 = [resp[0].booking_id];
          let query4 = utility.sqlQuery(sql4, data4);
          query4.then(() => {
            res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
            });
          }).catch((err) => {
            res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
            });
          });
        }); 
      }).catch((err) => {
        res.json({
          ResponseMsg                 : err,
          ResponseFlag                : 'F'
        });
      }); 
    }else {
      var book1 = {
        customer_id: result[0].user_id,
        aquaintance: info.aquaintance,
        base_price: info.base_price,
        final_price: info.final_price,
        booking_creation: today,
        booking_updation: today
      }
      let sql1 = 'INSERT INTO booking_customer SET ?';
      let data1 = [book1];
      let query1 = utility.sqlQuery(sql1, data1);
      let sql = 'SELECT MAX(booking_id) FROM booking_customer WHERE customer_id = ?';
      let data = [result[0].user_id];
      let query = utility.sqlQuery(sql, data);
      query.then((resp) => {
        var book2 = {
          event_id: info.event_id,
          id_booking: resp[0].booking_id,
          event_creation: today,
          event_updation: today
        }
        let sql2 = 'INSERT INTO customer_event SET ?';
        let data2 = [book2];
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
  rate,
  promoCheck
}