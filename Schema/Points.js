const mongoose = require('mongoose')

const {Schema} = mongoose;

const points = new Schema({
    orderNo:  { type: String},
    empCode:  { type: String},
    orderDate:{type:Date},
    points:   {type:Number},
})

module.exports = mongoose.model('points', points);