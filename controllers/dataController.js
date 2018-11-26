const dataService = require('../services/dataService');
const dishes = require('../dishes/meta00001.json');
const utility = require('../services/utilityService');

function home(req, res) {
  let data = req.body;
  let tokenVerified = utility.verifyToken(req);
  let loggedIn = utility.loggedIn(data);
  Promise.all([tokenVerified, loggedIn]).then((authData) => {
    res.json({
      ResponseMsg: 'Welcome..',
      ResponseFlag: 'S',
      authData: authData,
      dishes: dishes
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