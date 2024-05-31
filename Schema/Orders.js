const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderNo: { type: String},
    orderStatus: { type: String},
    orderDate: { type: Date},
    firstName: { type: String},
    lastName: { type: String},
    address: { type: String},
    city: { type: String},
    postalCode: { type: String},
    emailId: { type: String},
    phNo: { type: String},
    orderTotal: { type: String},
    discountAmount: { type: String},
    netAmount: { type: String},
    points: { type: Number},
    courseName: { type: String},
    empCode: { type: String}
});

module.exports = mongoose.model('Order', orderSchema);
