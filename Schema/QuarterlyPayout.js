const mongoose = require('mongoose')

const {Schema} = mongoose;

const TDSSchema = new Schema({
  empCode: String,
  employeeName:String,
  roleName:String,
  department:String,
  zone:String,
  region:String,
  area:String,
  payoutType:String,
  payrollCompanyName:String,
  payrollCompanyEmployeeCode:String,
  year:String,
  quarter:String,
  points: Number,
  quarterlyCommissionPerPoints: Number,
  quarterlyCommission: Number,
  totalCommission: Number,
  tdsAmount: Number,
  netPayout: Number,
  transacationId:Number,
  transactionDate:Date,
  transactionStatus:String,
  report:String
})

module.exports = mongoose.model('QuarterlyPayout',TDSSchema);