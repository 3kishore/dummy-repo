const express = require('express')
const Video = require('../Schema/VideoSchema')

const router = express.Router()
const authGuard = require('../middleware/auth-middleware');


router.post('/upload-training-video',authGuard,async(req,res)=>{
    const videoPaths = req.body; // Expecting an array of video paths

    if (!Array.isArray(videoPaths) || videoPaths.length === 0) {
      return res.status(400).json({ error: 'No videos provided' });
    }
  
    try {
      const del = await Video.deleteMany({})
      const videoDocuments = videoPaths.map(videoPath => ({ Video: videoPath }));
      const result = await Video.insertMany(videoDocuments);
  
      res.status(201).json({ "status":true,"message":"success","content":null});
    } catch (error) {
      console.error('Error uploading videos', error);
      res.status(500).json({"status":false,"message":"Failed","content":error})
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