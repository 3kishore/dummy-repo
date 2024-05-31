const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SalesSchema = new Schema({
    empCode: { type: String},
    OrderDate:{type:Date},
    MyPoints:{type:Number},
    TeamPoints:{type:Number}

})

module.exports = mongoose.model('Sales', SalesSchema);
