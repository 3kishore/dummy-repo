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
  month:String,
  year:String,
  quarter:String,
  points: Number,
  monthlyCommissionPerPoints:Number,
  monthlyFixedCommission: Number,
  monthlySpecialCommissionPerPoints: Number,
  monthlySpecialCommission: Number,
  totalCommission: Number,
  tdsAmount: Number,
  netPayout: Number,
  transacationId:String,
  transactionDate:Date,
  transactionStatus:String,
  report:String
})

module.exports = mongoose.model('MonthlyPayout',TDSSchema);