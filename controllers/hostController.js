const hostService = require('../services/hostService');

function saveDish(req,res){
    let info = req.body;
    hostService.dishSave(info, res);
    
}

function hostDishes(req,res){
    let info = req.body;
    hostService.dishHost(info, res);
}

module.exports = {
    saveDish,
    hostDishes
}