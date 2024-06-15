const express = require('express');
const tds = require('../Schema/TDS')
const quarterly = require('../Schema/QuarterlyPayout')
const annual=require('../Schema/AnnualPayout')
const excel = require('../middleware/TDS')

const router = express.Router();

const authGuard = require('../middleware/auth-middleware');

router.post('/upload-employee-payout',async(req,res)=>{
    try{
        const Path = req.body.filePath
        await excel.importData(Path).then(()=>{
            res.status(200).json({"status":true,"message":"success","content":null})
        }).catch(err=>{
            console.log(err)
            res.status(500).json({"status":false,"message":"Failed","content":err.message})
        });;
       
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

router.post('/get-my-monthly-payout-report',authGuard,async(req,res)=>{
    try{
        const empCode = req.body.empCode
        const month = req.body.month
        const year = req.body.year
        const myPayOut = await tds.find({"empCode": empCode, "month": month, "year": year,"report":"Month"})
        res.status(200).json({"status":true,"message":"success","content":myPayOut})


    }catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":err.message})
        console.log(err)
    }
   
})

router.post('/get-my-quarterly-payout-report',authGuard,async(req,res)=>{
    try{
        const empCode = req.body.empCode
        // const quarter = req.body.quarter
        // const year = req.body.year
        //const myPayOut = await quarterly.find({"empCode": empCode, "quarter": quarter, "year": year,"report":"Quarter"})
        const myPayOut = await quarterly.find({"empCode": empCode})
        res.status(200).json({"status":true,"message":"success","content":myPayOut})


    }catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":err.message})
        console.log(err)
    }
   
})

router.post('/get-my-annual-payout-report',authGuard,async(req,res)=>{
    try{
        const empCode = req.body.empCode
        
        //const year = req.body.year
        //const myPayOut = await annual.find({"empCode": empCode, "year": year,"report":"Annual"})
        const myPayOut = await annual.find({"empCode": empCode})
        res.status(200).json({"status":true,"message":"success","content":myPayOut})


    }catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":err.message})
        console.log(err)
    }
   
})

router.post('/get-my-payout-report',authGuard,async(req,res)=>{
    try{
        const myTDS = await tds.find({empCode:req.body.empCode}).exec()
        res.status(200).json({"status":true,"message":"success","content":myTDS})
    }
    catch(err){
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

module.exports = router