const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const utility = require('../services/utilityService');

router.post('/home', utility.splitHeader, dataController.home);

router.post('/getdish', utility.splitHeader, dataController.dish);

router.post('/getevent', utility.splitHeader, dataController.event);

router.post('/fetchprofile', function(req,res){

});

router.post('/updateprofile', function(req,res){
    
});

router.post('/myhostings', function(req,res){
      
});

router.post('/myvisits', function(req,res){
  
});

module.exports = router;