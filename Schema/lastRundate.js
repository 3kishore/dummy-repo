const mongoose = require('mongoose')

const {Schema} = mongoose;

const lastRundate = new Schema({
    _id: { type: String, required: true }, 
   lastRundate: { type: Date,default: new Date(2024,0,1)}
})

module.exports = mongoose.model('Rundate', lastRundate);