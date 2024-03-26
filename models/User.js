const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    name: {
      type: String,
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
    ratings: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        rating: { type: Number, default: 0 },
      },
    ],
    location: String,
    contact: { type: String, default: "" },
    about: { type: String, default: "" },
    categories: [{ type: mongoose.Types.ObjectId, ref: "Category" }],
    verify: { type: Boolean, default: false },
    amount: Number,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
