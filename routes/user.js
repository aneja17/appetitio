const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const utility = require('../services/utilityService');

router.post('/home', utility.verifyToken, dataController.home);

router.post('/getDish', dataController.dish);

router.post('/fetchprofile', function(req,res){

});

router.post('/updateprofile', function(req,res){
    
});

router.post('/myhostings', function(req,res){
      
});

router.post('/myvisits', function(req,res){
  
});

module.exports = router;