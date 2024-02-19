const mongoose = require("mongoose");

const beneficiaryRequestSchema = new mongoose.Schema({
    beneficiary: { type: mongoose.Types.ObjectId, ref: "User" },
    benefactor: { type: mongoose.Types.ObjectId, ref: "User" },
    category: String,
    message: String,
    status: { type: String, default: "Pending" }
});

const BeneficiaryRequest = mongoose.model("BeneficiaryRequest", beneficiaryRequestSchema);

module.exports = BeneficiaryRequest;