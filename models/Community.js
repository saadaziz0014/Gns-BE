const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
    org: { type: mongoose.Types.ObjectId, ref: 'User' },
    volunteers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    title: String,
    allowed: Number,
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;