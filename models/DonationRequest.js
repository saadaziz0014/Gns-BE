const mongoose = require("mongoose");

const donationRequestSchema = new mongoose.Schema({
    beneficiary: { type: mongoose.Types.ObjectId, ref: "User" },
    title: String,
    message: String,
    amount: { type: Number, default: 0 },
    amountRequired: Number,
    status: { type: String, default: "Pending" }
});

const DonationRequest = mongoose.model("DonationRequest", donationRequestSchema);

module.exports = DonationRequest;