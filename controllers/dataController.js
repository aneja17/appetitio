const jwt = require('jsonwebtoken');
const dataService = require('../services/dataService');
const dishes = require('../config/data_records_27638.json');

//verifyToken is a middleware function
function home(req, res) {
  jwt.verify(req.token, process.env.LOGIN_SECRET, function (err, authData) {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      res.json({
        ResponseMsg: 'Welcome..',
        ResponseFlag: 'S',
        authData: authData,
        dishes: dishes
      });
    }
  });
}

function dish(req, res){
  let data = req.body;
  dataService.getDish(data, res);
}

module.exports = {
    home,
    dish
}