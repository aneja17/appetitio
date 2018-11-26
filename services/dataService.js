const utility = require('./utilityService');
const fs = require('fs');
const path = require('path');
let configBuffer = {};
function getDish(data, res){
    let id = Number(data.dish_id);
    let number = "";
    for(let j=0;j<5-id.toString().length;j++){
        number += "0";
    }
    number += id.toString();
    configBuffer = fs.readFileSync(path.resolve(__dirname, `../dishes/meta${number}.json`), 'utf-8');
    configBuffer = JSON.parse(configBuffer);
    let dish = {
        ingredientsLines: configBuffer.ingredientLines,
        name: configBuffer.name,
        course: configBuffer.attributes.course,
        cuisine: configBuffer.attributes.cuisine,
    }
    res.json({
        ResponseMsg: 'Dish',
        ResponseFlag: 'S',
        dish: dish
    });
}

function getEvent(info, res){
    let now = new Date();
    let w = 0;
    let event = [];
    let eventDetails = {};
    let dishDetails = {};
    let ownerDetails = {};
    let sql = 'SELECT event_id, max_customers, base_price FROM booking WHERE meal_date >= ? and meal_time > ?';
    let data = [now.getDate, (now.getMilliseconds + 7200000)];
    let query = utility.sqlQuery(sql, data);
    query.then((result1) => {
        for(let j=0; j<result1.length; j++){
            let sql1 = 'SELECT dish_id FROM event_dishes WHERE event_id = ?';
            let data1 = [result1[j].event_id];
            let query1 = utility.sqlQuery(sql1, data1);
            query1.then((result2) => {
                for(let x=0; x<result2.length; x++){
                    let sql2 = 'SELECT * FROM owner_dishes WHERE dish_id = ?';
                    let data2 = [result2[x].dish_id];
                    let query2 = utility.sqlQuery(sql2, data2);
                    query2.then((result3) => {
                        let sql3 = 'SELECT first_name, last_name, mobile, latitude, longitude, address, user_rating FROM users WHERE user_id = ?';
                        let data3 = [result3[0].user_id];
                        let query3 = utility.sqlQuery(sql3, data3);
                        query3.then((resp) => {
                            eventDetails["event_id"] = result1[j].event_id;
                            eventDetails["max_customers"] = result1[j].max_customers;
                            eventDetails["base_price"] = result1[j].base_price;

                            dishDetails["dish_id"] = result2[x].dish_id;
                            dishDetails["dish_name"] = result3[0].dish_name;
                            dishDetails["dish_type"] = result3[0].dish_type;
                            dishDetails["cuisine_type"] = result3[0].cuisine_type;
                            dishDetails["temperature"] = result3[0].temperature;
                            dishDetails["ingredients"] = result3[0].ingredients;
                            dishDetails["reference_dish"] = result3[0].reference_dish;

                            ownerDetails["first_name"] = resp[0].first_name;
                            ownerDetails["last_name"] = resp[0].last_name;
                            ownerDetails["mobile"] = resp[0].mobile;
                            ownerDetails["latitude"] = resp[0].latitude;
                            ownerDetails["longitude"] = resp[0].longitude;
                            ownerDetails["address"] = resp[0].address;
                            ownerDetails["user_rating"] = resp[0].user_rating;

                            eventDetails["dish_details"] = dishDetails;
                            eventDetails["owner_details"] = ownerDetails;

                            event.push(eventDetails);
                            ++w;
                            if(w == result2.length){
                                res.json({
                                    ResponseMsg                 : 'Successful',
                                    ResponseFlag                : 'S',
                                    Events                       : event
                                });
                            }
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

module.exports = {
    getDish,
    getEvent
}