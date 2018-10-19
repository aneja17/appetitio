const utility = require('../services/utilityService');

function saveDish(req,res){
    let data = req.body;
    let today = new Date();
    let sql = 'SELECT user_id FROM users where mobile = ?';
    let query = utility.sqlQuery(sql, [data.mobile]);
    query.then((result) => {
      let dish = {
        user_id: result[0].user_id,
        dish_name: data.dish_name,
        dish_type: data.dish_type,
        cuisine_type: data.cuisine_type,
        temperature: data.temperature,
        ingredients: data.ingredients,
        creation: today,
        updation: today
      }
      let sql1 = 'INSERT INTO owner_dishes SET ?';
      let query1 = utility.sqlQuery(sql1, [dish]);
      query1.then(() => {
          res.json({
            ResponseMsg: 'Dish Saved Successfully',
            ResponseFlag: 'S'
          });
      }).catch(function(err) {
          res.json({
              ResponseMsg                 : err,
              ResponseFlag                : 'F'
          });
      });
    }).catch(function(err) {
      res.status(422).json({
          status                      : err,
          ResponseMsg                 : 'Invalid request data',
          ResponseFlag                : 'F'
      });
    });
}

function hostDishes(req,res){
    let data = req.body;
    let today = new Date();
    let host = {
      meal_time: data.meal_time,
      max_customers: data.max_customers,
      base_price: data.base_price,
      dish_id: JSON.stringify(data.dish_id),
      creation: today,
      updation: today
    }
    let sql = 'INSERT INTO hosting_view SET ?';
    let query = utility.sqlQuery(sql, [host]);
    query.then(() => {
      res.json({
        ResponseMsg: 'Hosted Successfully',
        ResponseFlag: 'S'
      });
    }).catch((err) => {
      res.json({
        ResponseMsg                 : err,
        ResponseFlag                : 'F'
      });
      return;
    });
    // let sql1 = 'SELECT event_id FROM booking WHERE meal_time = ?';
    // let query1 = utility.sqlQuery(sql1, [data.meal_time]);
    // query1.then((result) => {
    //     let event = {
    //       event_id: result[0].event_id,
    //       dish_id: JSON.stringify(data.dish_id),
    //       creation: today,
    //       updation: today
    //     }
    //     let sql2 = 'INSERT INTO event SET ?';
    //     let query2 = utility.sqlQuery(sql2, [event]);
    //     Promise.all([query,query2]).then(() => {
          // res.json({
          //   ResponseMsg: 'Booked Successfully',
          //   ResponseFlag: 'S'
          // });
    //     }).catch(function(err) {
    //         let q = true;
    //         while(q){
    //           let sql3 = 'DELETE FROM booking WHERE event_id = ?';
    //           let query3 = utility.sqlQuery(sql3, [result[0].event_id]);
    //           let condition = query3.then((result) => {
    //             return result;
    //           });
    //           if(condition){
    //             q = false;
    //           }
    //         }
    //         res.json({
    //             ResponseMsg                 : err,
    //             ResponseFlag                : 'F'
    //         });
    //         return;
    //     });
    // }).catch(function(err) {
    //     res.json({
    //         ResponseMsg                 : err,
    //         ResponseFlag                : 'F'
    //     });
    //     return;
    // }); 
}

module.exports = {
    saveDish,
    hostDishes
}