const jwt = require('jsonwebtoken');
const utility = require('../services/utilityService');

//verifyToken is a middleware function
function home(req, res) {
    jwt.verify(req.token, process.env.LOGIN_SECRET, function (err, authData) {
      console.log('h');
      if (err) {
        console.log(err);
        res.sendStatus(403);
      } else {
        res.json({
          ResponseMsg: 'Welcome..',
          ResponseFlag: 'S',
          authData: authData
        });
      }
    });
}

module.exports = {
    home
}