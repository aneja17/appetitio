const cron = require('node-cron');
const utility = require('./services/utilityService');

let now = new Date();
var task = cron.schedule('1 0 0 * * *', () => {
    let get = {
        is_active : '1'
    }
    let sql = 'SELECT expiry FROM user_session WHERE is_active = ?';
    let data = [get];
    let query = utility.sqlQuery(sql, data);
    query.then((result) => {
        for(let i = 0; i < result.length; i++){
            if(result[i].expiry <= now){
                let activeNess = {
                    is_active : '0',
                    sess_updation : now
                }
                let sql1 = 'UPDATE user_session SET ? WHERE expiry = ?';
                let data1 = [activeNess, result[i].expiry];
                let query1 = utility.sqlQuery(sql1, data1);
                query1.then((resp) => {
                    console.log('Ran a job at 00:00 and logged out the user');
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    }).catch((err) => {
        console.log(err);
    });
});

module.exports = {
    task
}