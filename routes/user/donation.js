const { jazzCashTransaction } = require("../../helper/payment");
const Donation = require("../../models/DonationBox");
const DonationRequest = require("../../models/DonationRequest");
const User = require("../../models/User");

const router = require("express").Router();

router.post("/makeRequest", async (req, res) => {
  try {
    const { beneficiary, message, title, amountRequired } = req.body;
    await DonationRequest.create({
      beneficiary,
      message,
      title,
      amountRequired,
    });
    res.status(201).json({ success: true, message: "Request Added" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/viewRequests", async (req, res) => {
  try {
    const allRequests = await DonationRequest.find({ status: "Pending" });
    res.status(201).json({ success: true, allRequests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/detailedRequest/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const request = await DonationRequest.findById(id);
    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/myRequests/:beneficiaryId", async (req, res) => {
  try {
    const beneficiary = req.params.beneficiaryId;
    const requests = await DonationRequest.find({ beneficiary });
    res.status(201).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/deleteRequest/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    await DonationRequest.deleteOne({ _id: requestId, status: "Pending" });
    res.status(201).json({ success: true, message: "Request Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { userId, amount, number } = req.body;
    let paymentResp = await jazzCashTransaction(amount, number);
    if (paymentResp.success != true) {
      return res
        .status(203)
        .json({ result: paymentResp.response.pp_ResponseMessage });
    }
    await Donation.create({
      userId,
      amount,
      refNo: paymentResp.response.pp_TxnRefNo,
    });
    await User.findOneAndUpdate(
      {
        email: "sgenservepk@gmail.com",
      },
      { $inc: { amount } }
    );
    res.status(201).json({ success: true, message: "Donation Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/all", async (req, res) => {
  try {
    // console.log("object")
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .populate("userId");
    let admin = await User.findOne({ email: "sgenservepk@gmail.com" });
    let sum = admin.amount;
    res.status(201).json({ success: true, data: { donations, sum } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
