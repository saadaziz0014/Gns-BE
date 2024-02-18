const express = require("express");

const app = express();
const authRouter = require("./auth/auth");
const userRouter = require("./admin/user");
const contactRouter = require("./contact/contact");
const adminAuthRouter = require("./admin/auth");
const categoryRouter = require("./admin/category");
const userRouters = require("./user/user");
const requestRouter = require("./user/request");
const donationRouter = require("./user/donation");
const adminDonationRouter = require("./admin/donation");

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/contact", contactRouter);
app.use("/adminAuth", adminAuthRouter);
app.use("/category", categoryRouter);
app.use("/users", userRouters);
app.use("/request", requestRouter);
app.use("/donation", donationRouter);
app.use("/adminDonation", adminDonationRouter);

module.exports = app;
