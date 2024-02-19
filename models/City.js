const mongoose = require("mongoose");

const City = mongoose.model(
  "City",
  mongoose.Schema({}, { collection: "cities" })
);

module.exports = City;
