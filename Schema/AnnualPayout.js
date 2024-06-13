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
  points: Number,
  annualCommissionPerPoints: Number,
  annualSpecialCommission: Number,
  tdsAmount: Number,
  netPayout: Number,
  report:String
})

module.exports = mongoose.model('AnnualPayout',TDSSchema);