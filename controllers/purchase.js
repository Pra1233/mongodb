const Razorpay = require("razorpay");
const Order = require("../models/orders.js");
const User = require("../models/Signup");
const userController = require("./Usercontroller");
require("dotenv").config();

exports.purchasepremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        console.log(err);
        throw new Error(JSON.stringify(err));
      }

      Order.create({ orderid: order.id, status: "PENDING" })
        .then(() => {
          console.log("24sdaasdsaasddasdsa", order, rzp.key_id);
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_id, order_id } = req.body;

    // Find the order by order_id
    const order = await Order.findOne({ orderid: order_id });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order with payment_id and status
    order.paymentid = payment_id;
    order.status = "SUCCESSFUL";
    await order.save();

    // Update the user to set ispremiumuser to true
    const user = await User.findByIdAndUpdate(
      userId,
      { ispremiumuser: true },
      { new: true } // Return the updated user
    );

    // Generate an access token if needed
    const token = userController.generateAccessToken(userId, undefined, true);

    return res.status(202).json({
      success: true,
      message: "Transaction Successful",
      token: token, // Use the generated token
    });
  } catch (e) {
    console.log(e);
    res.status(403).json({ error: e, message: "Something went wrong" });
  }
};
