const utility = require('./utilityService');

function dishSave(info, res){
    let today = new Date();
    let sql = 'SELECT user_id FROM users where mobile = ?';
    let data = [info.mobile];
    let query = utility.sqlQuery(sql, data);
    query.then((result) => {
      let dish = {
        user_id: result[0].user_id,
        dish_name: info.dish_name,
        dish_type: info.dish_type,
        cuisine_type: info.cuisine_type,
        temperature: info.temperature,
        ingredients: JSON.stringify(info.ingredients),
        creation: today,
        updation: today
      }
      let sql1 = 'INSERT INTO owner_dishes SET ?';
      let data1 = [dish];
      let query1 = utility.sqlQuery(sql1, data1);
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

function dishHost(info, res){
    let today = new Date();
    let sql5 = 'SELECT user_id FROM users WHERE mobile = ?';
    let data5 = [info.mobile];
    let query5 = utility.sqlQuery(sql5, data5);
    query5.then((results) => {
      let ownerId = {
        user_id: results[0].user_id,
        event_creation: today,
        event_updation: today
      }
      let sql3 = 'INSERT INTO owner_event SET ?';
      let data3 = [ownerId];
      let query3 = utility.sqlQuery(sql3, data3);
      let sql = 'SELECT MAX(event_id) FROM owner_event WHERE user_id = ?';
      let data = [results[0].user_id];
      let query = utility.sqlQuery(sql, data);
      query.then((result) => {
        for(i=0; i< info.dish_id.toString().length - 1; i++){
          let host1 = {
            event_id: result[0].event_id,
            dish_id: info.dish_id[i],
            creation: today,
            updation: today
          }
          let sql1 = 'INSERT INTO event_dishes SET ?';
          let data1 = [host1];
          var query1 = utility.sqlQuery(sql1, data1);
        }
        let host2 = {
          event_id: result[0].event_id,
          meal_time: info.meal_time,
          meal_date: info.meal_date,
          max_customers: info.max_customers,
          base_price: info.base_price,
          booking_creation: today,
          booking_updation: today
        }
        let sql2 = 'INSERT INTO booking SET ?';
        let data2 = [host2];
        let query2 = utility.sqlQuery(sql2, data2);
        Promise.all([query1, query2]).then(() => {
          res.json({
            ResponseMsg: 'Hosted Successfully',
            ResponseFlag: 'S'
          });
        }).catch(function(err) {
            let sql4 = 'DELETE event_dishes, owner_event FROM event_dishes INNER JOIN owner_event WHERE event_dishes.event_id = owner_event.event_id and event_dishes.event_id = ?';
            let data4 = [result[0].event_id];
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
        return;
      });
    }).catch(function(err) {
      res.status(422).json({
          status                      : err,
          ResponseMsg                 : 'Invalid request data',
          ResponseFlag                : 'F'
      });
    });
}

module.exports = {
    dishSave,
    dishHost
}