const authService = require('../services/authService');
const authValidator = require('../validators/authValidation');
const utility = require('../services/utilityService');

function login(req, res) {
  let data = req.body;
  authService.loginUser(data, res);
}

function changePassword(req,res){
  let data = req.body;
  let tokenVerified = utility.verifyToken(req);
  let loggedIn = utility.loggedIn(data);
  Promise.all([tokenVerified, loggedIn]).then((authData) => {
    let valid = authValidator.changePasswordValidate(data);
    authService.changeUserPassword(valid, res);
  }).catch((err) => {
    res.sendStatus(403);
  });
  
}

function logout(req, res) {
  let info = req.body;
  let tokenVerified = utility.verifyToken(req);
  let loggedIn = utility.loggedIn(info);
  Promise.all([tokenVerified, loggedIn]).then((authData) => {
    let valid = authValidator.logoutValidate(info);
    authService.logoutUser(valid, res);
  }).catch((err) => {
    res.sendStatus(403);
  });
}

module.exports = {
  login,
  changePassword,
  logout
}