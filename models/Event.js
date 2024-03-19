const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    community: { type: mongoose.Types.ObjectId, ref: "Community" },
    purpose: String,
    date: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
