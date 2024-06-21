const mongoose = require('mongoose')

const {Schema} = mongoose;

const points = new Schema({
    orderNo:  { type: String},
    empCode:  { type: String},
    orderDate:{type:Date},
    points:   {type:Number},
    referalId: { type: String, default: '' },
    createDate: { type: Date, default: Date.now},
    orderTotal: { type: String},
    discountAmount: { type: String},
    netAmount: { type: String},
    orderMonth:{type:Number},
    orderQuarter:{type:String},
    orderYear:{type:Number},
})

module.exports = mongoose.model('points', points);