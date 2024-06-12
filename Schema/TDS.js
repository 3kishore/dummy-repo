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
  payrollType:String,
  payrollCompanyName:String,
  payrollCompanyEmployeeCode:String,
  month:String,
  year:String,
  quarter:String,
  points: Number,
  fixedCommissionPerPoint:Number,
  fixedCommission: Number,
  commissionPerPoints: Number,
  commission: Number,
  totalCommission: Number,
  tdsAmount: Number,
  netPayout: Number,
  report:String
})

module.exports = mongoose.model('TDS',TDSSchema);