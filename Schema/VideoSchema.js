const mongoose = require('mongoose')

const {Schema} = mongoose;

const Video = new Schema({
    Video:String
})

module.exports = mongoose.model('Video',Video);