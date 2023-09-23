const mongoose = require("mongoose");
const Schema = mongoose.Schema; //Schema is class of mongoose used to define schema of mogodb document
//constructor
const orderSchema = new Schema({
  products: [
    {
      productData: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],

  user: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      reqired: true,
      ref: "User",
    },
  },
});

module.exports = mongoose.model("Order", orderSchema);
