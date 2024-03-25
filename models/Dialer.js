const mongoose = require("mongoose");

const Dialer = mongoose.model(
  "Dialer",
  mongoose.Schema({}, { collection: "dialers" })
);

module.exports = Dialer;
