const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    otp: String
}, { timestamps: true });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;