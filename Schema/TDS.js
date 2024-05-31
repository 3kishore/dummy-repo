const mongoose = require('mongoose')

const {Schema} = mongoose;

const TDSSchema = new Schema({
    empCode:String,
    Month:String,
    TdsAmount:String,
})

module.exports = mongoose.model('TDS',TDSSchema);