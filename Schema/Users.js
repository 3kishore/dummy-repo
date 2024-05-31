const mongoose = require('mongoose');

const {Schema} = mongoose;

const userSchema = new Schema({
    excelId: String,
    name: String,
    nameAr: String,
    birthDate: String,
    gender: String,
    isActive: Boolean,
});

module.exports = mongoose.model('Users',userSchema);