const mongoose = require("mongoose");
const Schema = mongoose.Schema; //Schema is class of mongoose used to define schema of mogodb document
//constructor
const productSchema = new Schema({
  //it is schema less but we can control flexibity

  title: String,

  price: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  imageUrl: {
    type: String,
  },

  userId: {
    //reference
    type: Schema.Types.ObjectId,
    ref: "User", //related to which model
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
