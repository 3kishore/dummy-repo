const express = require('express');
const tds = require('../Schema/TDS')
const excel = require('../middleware/TDS')

const router = express.Router();

const authGuard = require('../middleware/auth-middleware');

router.post('/upload-employee-payout',authGuard,async(req,res)=>{
    try{
        excel.importData();
        res.status(200).json({"status":true,"message":"success","content":null})
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

router.get('/get-my-payout-report',authGuard,async(req,res)=>{
    try{
        const myTDS = await tds.find({empCode:req.query.empCode}).exec()
        res.status(200).json({"status":true,"message":"success","content":myTDS})
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

module.exports = router