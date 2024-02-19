const mongoose = require("mongoose");

const donationBoxSchema = new mongoose.Schema({
    email: String,
    amount: Number,
}, { timestamps: true })

const Donation = mongoose.model("Donation", donationBoxSchema);

module.exports = Donation;