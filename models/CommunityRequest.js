const mongoose = require("mongoose");

const communityRequestSchema = new mongoose.Schema({
    community: { type: mongoose.Types.ObjectId, ref: "Community" },
    volunteer: { type: mongoose.Types.ObjectId, ref: "User" },
    organization: { type: mongoose.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, default: "Pending" },
}, { timestamps: true });

const CommunityRequest = mongoose.model('CommunityRequest', communityRequestSchema);

module.exports = CommunityRequest;