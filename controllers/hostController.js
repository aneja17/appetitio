const hostService = require('../services/hostService');
const utility = require('../services/utilityService');

function dishSave(req,res){
    let info = req.body;
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);
    Promise.all([tokenVerified, loggedIn]).then((authData) => {
        hostService.saveDish(info, res);
    }).catch((err) => {
        res.sendStatus(403);
    });    
}

function eventHosting(req,res){
    let info = req.body;
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);
    Promise.all([tokenVerified, loggedIn]).then((authData) => {
        hostService.hostEvent(info, res);
    }).catch((err) => {
        res.sendStatus(403);
    });  
}

function mealCancellation(req,res){
    let info = req.body; 
    let tokenVerified = utility.verifyToken(req);
    let loggedIn = utility.loggedIn(info);   
    Promise.all([tokenVerified, loggedIn]).then((authData) => { 
        hostService.cancelMeal(info,res);
    }).catch((err) => {
        res.sendStatus(403);
    }); 
}

module.exports = {
    dishSave,
    eventHosting,
    mealCancellation
}