const mongoose = require("mongoose");

const donationRequestBenSchema = new mongoose.Schema({
  beneficiary: { type: mongoose.Types.ObjectId, ref: "User" },
  benefactor: { type: mongoose.Types.ObjectId, ref: "User" },
  title: String,
  reason: String,
  guranterImam: {
    name: String,
    cnic: String,
    address: String,
    phone: String,
  },
  guranterCounciler: {
    name: String,
    cnic: String,
    address: String,
    phone: String,
  },
  amount: { type: Number, default: 0 },
  amountReceived: Number,
  refNoBenefactor: String,
  refNoBeneficiary: String,
  status: { type: String, default: "Initial" },
});

const DonationRequestBen = mongoose.model(
  "DonationRequestBen",
  donationRequestBenSchema
);

module.exports = DonationRequestBen;
