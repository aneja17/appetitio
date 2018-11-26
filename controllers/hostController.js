const hostService = require('../services/hostService');
const utility = require('../services/utilityService');

function saveDish(req,res){
    let info = req.body;
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);
    Promise.all([tokenVerified, loggedIn]).then((authData) => {
        hostService.dishSave(info, res);
    }).catch((err) => {
        res.sendStatus(403);
    });    
}

function hostDishes(req,res){
    let info = req.body;
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);
    Promise.all([tokenVerified, loggedIn]).then((authData) => {
        hostService.dishHost(info, res);
    }).catch((err) => {
        res.sendStatus(403);
    });  
}

module.exports = {
    saveDish,
    hostDishes
}