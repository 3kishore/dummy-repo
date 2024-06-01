const mongoose = require('mongoose')

const {Schema} = mongoose;

const TDSSchema = new Schema({
  empCode: String,
  dateOfPayout: String,
  monthlyCommissionPerPoints: Number,
  monthlyFixedCommission: Number,
  monthlySpecialCommissionPerPoints: Number,
  monthlySpecialCommission: Number,
  totalCommission: Number,
  tdsAmount: Number,
  netPayout: Number
})

module.exports = mongoose.model('TDS',TDSSchema);