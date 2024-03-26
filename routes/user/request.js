const { default: mongoose } = require("mongoose");
const BeneficiaryRequest = require("../../models/BeneficiaryRequest");
const User = require("../../models/User");
const DonationRequestBen = require("../../models/DonationRequestBen");
const nodemailer = require("nodemailer");

const router = require("express").Router();

var transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  auth: {
    user: process.env.MAIL_SENDER_EMAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

router.post("/makeRequest", async (req, res) => {
  try {
    const { beneficiary, benefactor, message, category } = req.body;
    await BeneficiaryRequest.create({
      benefactor,
      beneficiary,
      message,
      category,
    });
    let user = await User.findById(benefactor);
    const subject = "New Request Received";
    let body = `<p>Dear <strong>${user.name}</strong>,</p> <br/> <p> You Received new Beneficiary Request</p>`;
    const mailOptions = {
      from: `${process.env.MAIL_SENDER_NAME} <${process.env.MAIL_SENDER_EMAIL}>`,
      to: user.email,
      subject: subject,
      html: body,
    };
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error, "error in mail");
        return res
          .status(202)
          .json({ success: false, message: "Error in sending mail" });
      } else {
        res.status(201).json({ success: true, message: "Request Added" });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/viewRequests/:benefactorId", async (req, res) => {
  try {
    const benefactor = req.params.benefactorId;
    const allRequests = await BeneficiaryRequest.find({ benefactor }).populate(
      "beneficiary"
    );
    res.status(201).json({ success: true, allRequests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/decideRequest/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const decision = req.query.decision;
    let request = await BeneficiaryRequest.findByIdAndUpdate(
      id,
      { status: decision },
      { new: true }
    );
    let beneficiary = await User.findById(request.beneficiary);
    const subject = "Request Decision";
    let body = `<p>Dear <strong>${beneficiary.name}</strong>,</p> <br/> <p> Your Request has decided check it on genserve</p>`;
    const mailOptions = {
      from: `${process.env.MAIL_SENDER_NAME} <${process.env.MAIL_SENDER_EMAIL}>`,
      to: beneficiary.email,
      subject: subject,
      html: body,
    };
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error, "error in mail");
        return res
          .status(202)
          .json({ success: false, message: "Error in sending mail" });
      } else {
        res.status(201).json({ success: true, message: "Done" });
      }
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/detailedRequest/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const request = await BeneficiaryRequest.findById(id);
    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/myRequests/:beneficiaryId", async (req, res) => {
  try {
    const beneficiary = req.params.beneficiaryId;
    const requests = await BeneficiaryRequest.find({ beneficiary }).populate(
      "benefactor"
    );
    res.status(201).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/deleteRequest/:id", async (req, res) => {
  try {
    const requestId = req.params.id;
    await BeneficiaryRequest.deleteOne({ _id: requestId, status: "Pending" });
    res.status(201).json({ success: true, message: "Request Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/history/:id", async (req, res) => {
  try {
    const beneficiary = req.params.id;
    let history = await BeneficiaryRequest.find({ beneficiary });
    res.status(201).json({ success: true, history });
  } catch (error) {
    // console.log(error)
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/historyR/:id", async (req, res) => {
  try {
    const benefactor = req.params.id;
    let history = await BeneficiaryRequest.find({ benefactor });
    res.status(201).json({ success: true, history });
  } catch (error) {
    // console.log(error)
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/addDonationBen", async (req, res) => {
  try {
    const {
      beneficiary,
      benefactor,
      title,
      reason,
      amount,
      guranterImam,
      guranterCounciler,
    } = req.body;
    await DonationRequestBen.create({
      benefactor,
      beneficiary,
      title,
      amount,
      guranterCounciler,
      guranterImam,
      reason,
    });
    res.status(201).json({ success: true, message: "Request Added" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/allDonationBen/:id", async (req, res) => {
  try {
    const benefactor = req.params.id;
    const requests = await DonationRequestBen.find({
      status: "Verified",
      benefactor,
    }).populate("beneficiary");
    res.status(201).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/sendDonation/:id", async (req, res) => {
  try {
    const reqId = req.params.id;
    const amount = req.body.amount;
    await DonationRequestBen.findByIdAndUpdate(reqId, {
      status: "PaymentDone",
      amountReceived: amount,
    });
    res.status(201).json({ success: true, message: "Payment Done" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/myDonationBen/:id", async (req, res) => {
  try {
    const beneficiary = req.params.id;
    const requests = await DonationRequestBen.find({ beneficiary }).populate(
      "benefactor"
    );
    res.status(201).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/withdraw/:id", async (req, res) => {
  try {
    const reqId = req.params.id;
    await DonationRequestBen.findByIdAndDelete(reqId, { status: "Withdrawal" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
