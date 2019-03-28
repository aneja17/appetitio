const dataService = require('../services/dataService');
const dishes = require('../dishes/meta00001.json');
const utility = require('../services/utilityService');

function home(req, res) {
  let info = req.body;
  let tokenVerified = utility.verifyToken(req);
  let loggedIn = utility.loggedIn(info);
  Promise.all([tokenVerified, loggedIn]).then((authData) => {
    let promo_codes = [];
    let w=0;
    let sql = `SELECT promo_code, promo_redeemed FROM promo_user WHERE user_id = (SELECT user_id FROM users WHERE mobile = ${info.mobile})`;
    let data = [info.mobile];
    let query = utility.sqlQuery(sql, data);
    query.then((result) => {
      for(let i=0; i<result.length; i++){
        if(result[i].promo_redeemed == 0){
          promo_codes.push(result[i].promo_code);
          ++w;
          if(w == result.length){
            res.json({
              ResponseMsg: 'Welcome..',
              ResponseFlag: 'S',
              authData: authData,
              promo_codes: promo_codes,
              promo_flag: 'pu',
              dishes: dishes,
            });
          }
        }else {
          res.json({
            ResponseMsg: 'Welcome..',
            ResponseFlag: 'S',
            authData: authData,
            promo_codes: 'No promo codes right now',
            dishes: dishes,
          });
        }
      }
      if(result.length == 0){
        res.json({
        ResponseMsg: 'Welcome..',
        ResponseFlag: 'S',
        authData: authData,
        promo_codes: 'No promo codes right now',
        dishes: dishes,
      });
      }
    }).catch((err) => {
      res.json({
        ResponseMsg: err,
        ResponseFlag: 'F'
      });
    });
  }).catch((err) => {
    res.sendStatus(403);
  });
}

function dish(req, res){
  let data = req.body;
  let tokenVerified = utility.verifyToken(req);
  let loggedIn = utility.loggedIn(data);
  Promise.all([tokenVerified, loggedIn]).then((authData) => {
    dataService.getDish(data, res);
  }).catch((err) => {
    res.sendStatus(403);
  });
}

function event(req, res){
  let data = req.body;
  let tokenVerified = utility.verifyToken(req);
  let loggedIn = utility.loggedIn(data);
  Promise.all([tokenVerified, loggedIn]).then((authData) => {
    dataService.getEvent(data, res);
  }).catch((err) => {
    res.sendStatus(403);
  });
}

module.exports = {
    home,
    dish,
    event
}