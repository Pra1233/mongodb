const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  paymentid: String,
  orderid: String,
  status: String,
});

module.exports = mongoose.model("Order", orderSchema);
