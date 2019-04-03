const utility = require('./utilityService');

function promoCheck(info, res){
  let now = new Date();
  let sql = 'SELECT promo_id, promo_details, flag, discount, discount_type, number_of_meals, promo_expiry FROM promo WHERE promo_code = ?';
  let data = [info.promo_code];
  let query = utility.sqlQuery(sql, data);
  query.then((result) => {
    if(result.length == 0){
      res.json({
        ResponseMsg : 'Promo Doesn\'t exist',
        ResponseFlag : 'F'
      });
      return;
    }
    result.forEach(element => {
      if(element.flag == 'u'){
        let sql1 = 'SELECT number_of_meals, promo_expiry FROM promo_user WHERE user_id = (SELECT user_id FROM users where mobile = ?) and promo_id = ?';
        let data1 = [info.mobile, element.promo_id];
        let query1 = utility.sqlQuery(sql1, data1);
        query1.then((result1) => {
          if(result1.length == 0){
            res.json({
              ResponseMsg : 'Promo Doesn\'t exist',
              ResponseFlag : 'F'
            });
            return;
          }
          if(result1[0].number_of_meals > 0 && result1[0].promo_expiry >= now){
            let sql2 = 'SELECT base_price FROM booking WHERE event_id = ?';
            let data2 = [info.event_id];
            let query2 = utility.sqlQuery(sql2, data2);
            query2.then((result2) => {
              if(element.discount_type == 'PERCENTAGE'){
                final_price = result2[0].base_price - (element.discount * result2[0].base_price)/100;
              } else if(element.discount_type == 'FLAT'){
                final_price = result2[0].base_price - element.discount;
              }
              res.json({
                ResponseMsg : 'Promo Applied',
                final_price : final_price,
                ResponseFlag : 'S'
              });
              return;
            }).catch((err) => {
              res.json({
                ResponseMsg : 'No Such Event Exists.',
                ResponseFlag : 'F'
              });
              return;
            });
          } else if(result1[0].number_of_meals == 0){
            res.json({
              ResponseMsg : 'Promo can\'t be applied. You have used it maximum times',
              ResponseFlag : 'F'
            });
            return;
          } else if(result1[0].number_of_meals > 0 && result1[0].promo_expiry < now){
            res.json({
              ResponseMsg : 'Promo Expired.',
              ResponseFlag : 'F'
            });
            return;
          }
        }).catch((err) => {
          res.json({
            ResponseMsg : err,
            ResponseFlag : 'F'
          });
          return;
        });
      } else if(element.flag == 'g'){
        let sql3 = 'SELECT COUNT(*) AS count FROM promo_applied WHERE user_id = (SELECT user_id FROM users where mobile = ?) and promo_code = ?';
        let data3 = [info.mobile, info.promo_code];
        let query3 = utility.sqlQuery(sql3, data3);
        query3.then((result3) => {
          if(element.number_of_meals > result3[0].count && element.promo_expiry >= now){
            let sql2 = 'SELECT base_price FROM booking WHERE event_id = ?';
            let data2 = [info.event_id];
            let query2 = utility.sqlQuery(sql2, data2);
            query2.then((result2) => {
              if(element.discount_type == 'PERCENTAGE'){
                final_price = result2[0].base_price - (element.discount * result2[0].base_price)/100;
              } else if(element.discount_type == 'FLAT'){
                final_price = result2[0].base_price - element.discount;
              }
              res.json({
                ResponseMsg : 'Promo Applied',
                final_price : final_price,
                ResponseFlag : 'S'
              });
              return;
            }).catch((err) => {
              res.json({
                ResponseMsg : 'No Such Event Exists.',
                ResponseFlag : 'F'
              });
              return;
            });
          } else if(element.number_of_meals == result3[0].count){
            res.json({
              ResponseMsg : 'Promo can\'t be applied. You have used it maximum times',
              ResponseFlag : 'F'
            });
            return;
          } else if(element.number_of_meals > result3[0].count && element.promo_expiry < now){
            res.json({
              ResponseMsg : 'Promo Expired.',
              ResponseFlag : 'F'
            });
            return;
          }
        }).catch((err) => {
          res.json({
            ResponseMsg : err,
            ResponseFlag : 'F'
          });
          return;
        });
      } 
    });
  }).catch((err) => {
    res.json({
      ResponseMsg : err,
      ResponseFlag : 'F'
    });
  });
}

function promoApply(info){
  return new Promise(function (resolve, reject) {
    let now = new Date();
    let sql = 'SELECT promo_id, promo_details, flag, discount, discount_type, number_of_meals, promo_expiry FROM promo WHERE promo_code = ?';
    let data = [info.promo_code];
    let query = utility.sqlQuery(sql, data);
    query.then((result) => {
      if(result.length == 0){
        return reject(false);
      }
      result.forEach(element => {
        if(element.flag == 'u'){
          let sql1 = 'SELECT number_of_meals, promo_expiry FROM promo_user WHERE user_id = (SELECT user_id FROM users where mobile = ?) and promo_id = ?';
          let data1 = [info.mobile, element.promo_id];
          let query1 = utility.sqlQuery(sql1, data1);
          query1.then((result1) => {
            if(result1.length == 0){
              return reject(false);
            }
            if(result1[0].number_of_meals > 0 && result1[0].promo_expiry >= now){
              let sql2 = 'SELECT base_price, max_customers FROM booking WHERE event_id = ?';
              let data2 = [info.event_id];
              let query2 = utility.sqlQuery(sql2, data2);
              query2.then((result2) => {
                if(element.discount_type == 'PERCENTAGE'){
                  final_price = result2[0].base_price - (element.discount * result2[0].base_price)/100;
                } else if(element.discount_type == 'FLAT'){
                  final_price = result2[0].base_price - element.discount;
                }
                let fp = {
                  base_price : result2[0].base_price,
                  final_price : final_price,
                  promo_id : element.promo_id,
                  max_customers : result2[0].max_customers,
                  number_of_meals : result1[0].number_of_meals,
                  flag : 'u'
                }
                return resolve(fp);
              }).catch((err) => {
                return reject(false);
              });
            } else if(result1[0].number_of_meals == 0){
              return reject(false);
            } else if(result1[0].number_of_meals > 0 && result1[0].promo_expiry < now){
              return reject(false);
            }
          }).catch((err) => {
            return reject(false);
          });
        } else if(element.flag == 'g'){
          let sql3 = 'SELECT COUNT(*) AS count FROM promo_applied WHERE user_id = (SELECT user_id FROM users where mobile = ?) and promo_code = ?';
          let data3 = [info.mobile, info.promo_code];
          let query3 = utility.sqlQuery(sql3, data3);
          query3.then((result3) => {
            if(element.number_of_meals > result3[0].count && element.promo_expiry >= now){
              let sql2 = 'SELECT base_price, max_customers FROM booking WHERE event_id = ?';
              let data2 = [info.event_id];
              let query2 = utility.sqlQuery(sql2, data2);
              query2.then((result2) => {
                if(element.discount_type == 'PERCENTAGE'){
                  final_price = result2[0].base_price - (element.discount * result2[0].base_price)/100;
                } else if(element.discount_type == 'FLAT'){
                  final_price = result2[0].base_price - element.discount;
                }
                let fp = {
                  base_price : result2[0].base_price,
                  final_price : final_price,
                  promo_id : element.promo_id,
                  max_customers : result2[0].max_customers,
                  number_of_meals : element.number_of_meals,
                  flag : 'g'
                }
                return resolve(fp);
              }).catch((err) => {
                return reject(false);
              });
            } else if(element.number_of_meals == result3[0].count){
              return reject(false);
            } else if(element.number_of_meals > result3[0].count && element.promo_expiry < now){
              return reject(false);
            }
          }).catch((err) => {
            return reject(false);
          });
        } 
      });
    }).catch((err) => {
      return reject(false);
    });
  });
}

function mealBooking(info, res){
  let today = new Date();
  let sql = 'SELECT user_id FROM users where mobile = ?';
  let data = [info.mobile];
  let query = utility.sqlQuery(sql, data);
  query.then((result) => {
    if(info.promo_code){
      let promoUsed;
      let promoD = promoApply(info);
      promoD.then((results) => {
        promoUsed = {
          // promo_redeemed: 1,
          redeemed_on: today,
          number_of_meals : results.number_of_meals - 1,
          updation: today
        }
        if(results.flag == 'u'){
          let sql3 = 'UPDATE promo_user SET ? WHERE user_id = ? and promo_id = ?';
          let data3 = [promoUsed,result[0].user_id,results.promo_id];
          let query3 = utility.sqlQuery(sql3, data3);
          query3.catch((err) => {
            res.json({
              ResponseMsg                 : 'Error occured while booking, Please try again',
              ResponseFlag                : 'F'
            });
            return;
          });
        }
        logUsedPromo = {
          user_id : result[0].user_id,
          promo_id : results.promo_id,
          promo_code : info.promo_code,
        }
        let sql5 = 'INSERT INTO promo_applied SET ?';
        let data5 = [logUsedPromo];
        let query5 = utility.sqlQuery(sql5, data5);
        query5.catch((err) => {
          if(results.flag == 'u'){
            promoUsed = {
              // promo_redeemed: 0,
              // redeemed_on: null,
              number_of_meals : results.number_of_meals,
              updation: today
            };
            let sq = 'UPDATE promo_user SET ? WHERE promo_id = ?';
            let dt = [promoUsed,results.promo_id];
            let qury = utility.sqlQuery(sq, dt);
          }
        });
        var book1 = {
          customer_id: result[0].user_id,
          aquaintance: info.aquaintance,
          promo_id: results.promo_id,
          base_price: results.base_price,
          final_price: results.final_price,
          booking_creation: today,
          booking_updation: today
        }
        let sql1 = 'INSERT INTO booking_customer SET ?';
        let data1 = [book1];
        let query1 = utility.sqlQuery(sql1, data1);
        query1.catch((err) => {
          let sq, dt, qury;
          if(results.flag == 'u'){
            promoUsed = {
              // promo_redeemed: 0,
              // redeemed_on: null,
              number_of_meals : results.number_of_meals,
              updation: today
            };
            sq = 'UPDATE promo_user SET ? WHERE promo_id = ?';
            dt = [promoUsed,results.promo_id];
            qury = utility.sqlQuery(sq, dt);
          }
          let sq1 = 'DELETE FROM promo_applied WHERE user_id = ? and promo_id = ? ORDER BY redeemed_on DESC limit 1';
          let dt1 = [result[0].user_id, results.promo_id];
          let qury1 = utility.sqlQuery(sq1, dt1);
          Promise.all([qury, qury1]).then(() => {
            res.json({
              ResponseMsg                 : 'Error occured while booking, Please try again',
              ResponseFlag                : 'F'
            });
            return;
          }); 
        });
        let sql = 'SELECT b.booking_id FROM booking_customer b INNER JOIN (SELECT MAX(booking_creation) AS MaxDate FROM booking_customer GROUP BY customer_id) b1 ON b.customer_id = ? and b.booking_creation = b1.MaxDate';
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
          query2.catch(() => {
            let sq, dt, qury;
            if(results.flag == 'u'){
              promoUsed = {
                // promo_redeemed: 0,
                // redeemed_on: null,
                number_of_meals : results.number_of_meals,
                updation: today
              };
              sq = 'UPDATE promo_user SET ? WHERE promo_id = ?';
              dt = [promoUsed,results.promo_id];
              qury = utility.sqlQuery(sq, dt);
            }
            let sq1 = 'DELETE FROM promo_applied WHERE user_id = ? and promo_id = ? ORDER BY redeemed_on DESC limit 1';
            let dt1 = [result[0].user_id, results.promo_id];
            let qury1 = utility.sqlQuery(sq1, dt1);
            let sq2 = 'DELETE FROM booking_customer WHERE booking_id = ?';
            let dt2 = [resp[0].booking_id];
            let qury2 = utility.sqlQuery(sq2, dt2);
            Promise.all([qury, qury1, qury2]).then(() => {
              res.json({
                ResponseMsg                 : 'Error occured while booking, Please try again',
                ResponseFlag                : 'F'
              });
              return;
            }); 
          });
          Promise.all([query1, query2]).then(() => {
            res.json({
              ResponseMsg: 'Booked Successfully',
              ResponseFlag: 'S'
            });
          }).catch(function(err) {
            let sq, dt, qury;
            if(results.flag == 'u'){
              promoUsed = {
                // promo_redeemed: 0,
                // redeemed_on: null,
                number_of_meals : results.number_of_meals,
                updation: today
              };
              sq = 'UPDATE promo_user SET ? WHERE promo_id = ?';
              dt = [promoUsed,results.promo_id];
              qury = utility.sqlQuery(sq, dt);
            }
            let sq1 = 'DELETE FROM promo_applied WHERE user_id = ? and promo_id = ? ORDER BY redeemed_on DESC limit 1';
            let dt1 = [result[0].user_id, results.promo_id];
            let qury1 = utility.sqlQuery(sq1, dt1);
            let sq2 = 'DELETE FROM booking_customer WHERE booking_id = ?';
            let dt2 = [resp[0].booking_id];
            let qury2 = utility.sqlQuery(sq2, dt2);
            let sq3 = 'DELETE FROM customer_event WHERE event_id = ? and id_booking = ?';
            let dt3 = [info.event_id, resp[0].booking_id];
            let qury3 = utility.sqlQuery(sq3, dt3);
            Promise.all([qury, qury1, qury2, qury3]).then(() => {
              res.json({
                ResponseMsg                 : 'Error occured while booking, Please try again',
                ResponseFlag                : 'F'
              });
              return;
            });
          }); 
        }).catch((err) => {
          res.json({
            ResponseMsg                 : err,
            ResponseFlag                : 'F'
          });
        });
      }).catch((err) => {
        res.json({
          ResponseMsg                 : 'Error occured while booking, Please try again',
          ResponseFlag                : 'F'
        });
        return;
      }); 
    }else {
      let base_price, final_price;
      let sq = 'SELECT base_price FROM booking WHERE event_id = ?';
      let dt = [info.event_id];
      let q = utility.sqlQuery(sq, dt);
      q.then((result1) => {
        base_price = result1[0].base_price;
        final_price = result1[0].base_price;
      }).catch((err) => {
        res.json({
          ResponseMsg                 : 'Error occured while booking, Please try again',
          ResponseFlag                : 'F'
        });
        return;
      });
      var book1 = {
        customer_id: result[0].user_id,
        aquaintance: info.aquaintance,
        base_price: base_price,
        final_price: final_price,
        booking_creation: today,
        booking_updation: today
      }
      let sql1 = 'INSERT INTO booking_customer SET ?';
      let data1 = [book1];
      let query1 = utility.sqlQuery(sql1, data1);
      let sql = 'SELECT b.booking_id FROM booking_customer b INNER JOIN (SELECT MAX(booking_creation) AS MaxDate FROM booking_customer GROUP BY customer_id) b1 ON b.customer_id = ? and b.booking_creation = b1.MaxDate';
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
            BookingId : resp[0].booking_id,
            ResponseMsg : 'Booked Successfully',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
          let sql3 = 'DELETE booking_customer, customer_event FROM booking_customer INNER JOIN customer_event WHERE booking_customer.booking_id = customer_event.id_booking and booking_customer.booking_id = ?';
          let data3 = [resp[0].booking_id];
          let query3 = utility.sqlQuery(sql3, data3);
          query3.then(() => {
            res.json({
              ResponseMsg                 : 'Error occured while booking, Please try again',
              ResponseFlag                : 'F'
            });
            return;
          }).catch((err) => {
            res.json({
              ResponseMsg                 : 'Error occured while booking, Please try again',
              ResponseFlag                : 'F'
            });
            return;
          });
        });
      }).catch(function(err) {
        res.json({
          ResponseMsg                 : 'Error occured while booking, Please try again',
          ResponseFlag                : 'F'
        });
        return;
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
  let sql = 'SELECT has_checked_in FROM booking_customer WHERE booking_id = ?';
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
      let sql1 = 'UPDATE booking_customer SET ? WHERE booking_id = ?';
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
  let sql = 'SELECT is_cancelled FROM booking_customer WHERE booking_id = ?';
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
      let sql1 = 'UPDATE booking_customer SET ? WHERE booking_id = ?';
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
  let sql = 'SELECT has_checked_in FROM booking_customer WHERE booking_id = ?';
  let data = [info.booking_id];
  let query = utility.sqlQuery(sql, data);
  query.then((result) => {
    if(result[0].has_checked_in){
      let rAndC = {
        dish_rating: info.dish_rating,
        comments: info.comments,
        event_updation: today
      }
      let sql1 = 'UPDATE customer_event SET ? WHERE id_booking = ?';
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