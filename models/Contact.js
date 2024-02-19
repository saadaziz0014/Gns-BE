const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    message: String,
    email: String,
    phoneNo: String
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;