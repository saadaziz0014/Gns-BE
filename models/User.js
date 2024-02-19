const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Active",
    },
    location: String,
    contact: { type: String, default: '' },
    about: { type: String, default: "" },
    categories: [{ type: mongoose.Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
