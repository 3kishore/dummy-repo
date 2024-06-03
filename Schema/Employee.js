const mongoose = require('mongoose')

const {Schema} = mongoose;

const Employee = new Schema({
  referalId: { type: String, default: '' },
  empCode: { type: String, default:''},
  password:{ type: String, default:''},
  state: { type: String, default: 'TN' },
  emailId: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  mobileNo: { type: String, default: '' },
  department: { type: String, default: '' },
  role: { type: String, default: '' },
  payRoll: { type: String, default: '' },
  mappingId: { type: String, default: '' },
  region: { type: String, default: '' },
  zone: { type: String, default: '' },
  area: { type: String, default: '' },
  dob: { type: String, default: '' },
  gender: { type: String, default: '' },
  Points:{type:Number,default: 0},
  TeamPoints:{type:Number,default: 0},
  qualification: { 
    type: String, 
    default: 'OTHER' 
  },
  occupation: { type: String, default: '' },
  permenentAddress: {
    address: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' }
  },
  bothAddressAreSame: { type: String, default: '' },
  currentAddress: {
    address: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    postOffice: { type: String, default: '' }
  },
  aadharDetail: {
    address: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    postOffice: { type: String, default: '' }
  },
  panDetail: {
    number: { type: String, default: '' },
    name: { type: String, default: '' },
    proof: { type: String, default: '' }
  },
  bankDetail: {
    bankName: { type: String, default: '' },
    branchName: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountType: { type: String, default: '' },
    accountNo: { type: String, default: '' },
    nameAsPerBook: { type: String, default: '' },
    proof: { type: String, default: '' }
  },
  uploadDocumentCopy: { type: String, default: '' },
  photo: { type: String, default: '' }
})



  const NotesModel = mongoose.model("Employee", Employee);
  module.exports = NotesModel;