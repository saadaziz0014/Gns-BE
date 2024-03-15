const mongoose = require("mongoose");

const categoryRequestSchema = new mongoose.Schema({
    beneficiary: { type: mongoose.Types.ObjectId, ref: "User" },
    category: String
}, { timestamps: true })

const CategoryRequest = mongoose.model('CategoryRequest', categoryRequestSchema)

module.exports = CategoryRequest