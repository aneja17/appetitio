const authService = require('../services/authService');
const authValidator = require('../validators/authValidation');

function login(req, res) {
  let data = req.body;
  authService.loginUser(data, res);
}

function changePassword(req,res){
  let data = req.body;
  let valid = authValidator.changePasswordValidate(data);
  authService.changeUserPassword(valid, res);
}

function logout(req, res) {
  let info = req.body;
  authService.logoutUser(info, res);
}

module.exports = {
  login,
  changePassword,
  logout
}