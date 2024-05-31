const express = require('express')
const Video = require('../Schema/VideoSchema')

const router = express.Router()
const authGuard = require('../middleware/auth-middleware');

router.post('/upload-training-video',authGuard,async(req,res)=>{
    try {
        const newVideo = await Video.create(req.body)
        res.status(200).json({"status":true,"message":"success","content":null})
    } catch (err) {
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

router.get('/get-training-videos',authGuard,async(req,res)=>{
    try {
        const videos = await Video.find({}).exec()
        res.status(200).json({"status":true,"message":"success","content":videos})
    } catch (err) {
        res.status(500).json({"status":false,"message":"Failed","content":null})
    }
})

module.exports = router