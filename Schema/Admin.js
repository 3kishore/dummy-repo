const mongoose = require('mongoose')

const {Schema} = mongoose;

const Employee = new Schema({
  referalPersonName: { type: String, required: true },
  appliedFor: { type: String, required: true },
  location: { type: String, required: true },
  referedPersonEmpCode: { type: String, required: true },
  empCode: { type: String },
  password: { type: String },
  IsApproved: { type: Boolean, default: false },
  personalInfo: {
    type: new Schema({
      name: { type: String, required: true },
      dob: { type: String, required: true },
      gender: { type: String, required: true },
      age: { type: Number, required: true },
      mobileNo: { type: String, required: true },
      emailId: { type: String, required: true },
      qualification: { type: String, required: true },
      occupation: { type: String, required: true },
      Photo: { type: String, required: true },
    }),
    required: true
  },
  address: {
    type: new Schema({
      current: {
        type: new Schema({
          currentAddress: { type: String, required: true },
          district: { type: String, required: true },
          state: { type: String, required: true },
          postOffice: { type: String, required: true },
          pinCode: { type: String, required: true },
        }),
        required: true
      },
      isBothSame: { type: Boolean, required: true },
      permenent: {
        type: new Schema({
          permenentAddress: { type: String },
          district: { type: String },
          state: { type: String },
          postOffice: { type: String },
          pinCode: { type: String },
        })
      }
    }),
    required: true
  },
  identityInfo: {
    type: new Schema({
      aadharInfo: {
        type: new Schema({
          name: { type: String },
          aadharNo: { type: String },
          aadharCopy: { type: String }
        })
      },
      panInfo: {
        type: new Schema({
          name: { type: String },
          panNo: { type: String },
          panCopy: { type: String }
        })
      },
      bankInfo: {
        type: new Schema({
          name: { type: String, required: true },
          bankName: { type: String, required: true },
          branchName: { type: String, required: true },
          ifscCode: { type: String, required: true },
          accountNo: { type: String, required: true },
          accountType: { type: String, required: true },
          bankProof: { type: String, required: true }
        })
      },
      applicantSign: { type: String, required: true },
      referalSign: { type: String, required: true },
    }),
    required: true
  }
})

  const NotesModel = mongoose.model("Admin-Approval", Employee);
  module.exports = NotesModel;