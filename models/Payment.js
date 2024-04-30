const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bankName: String,
    transactionId: String,
    finalAmount: String,
    transactionStatus: String,
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
