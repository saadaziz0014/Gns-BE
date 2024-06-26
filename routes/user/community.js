const Community = require("../../models/Community");
const CommunityRequest = require("../../models/CommunityRequest");
const nodemailer = require("nodemailer");
const User = require("../../models/User");

const router = require("express").Router();

var transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  auth: {
    user: process.env.MAIL_SENDER_EMAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

router.post("/add", async (req, res) => {
  try {
    const { org, title, allowed } = req.body;
    const exist = await Community.findOne({
      title: { $regex: title, $options: "i" },
      isDeleted: false,
    });
    if (exist) {
      return res.status(202).json({ success: false, message: "Title exist" });
    }
    await Community.create({ org, title, allowed });
    res.status(201).json({ success: true, message: "Community Added" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/all", async (req, res) => {
  try {
    const communities = await Community.find({ isDeleted: false });
    res.status(201).json({ success: true, communities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/allA", async (req, res) => {
  try {
    const communities = await Community.find().populate("org");
    res.status(201).json({ success: true, communities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/toogle/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const community = await Community.findById(id);
    if (community.isDeleted == false)
      await Community.findByIdAndUpdate(id, { isDeleted: true });
    else await Community.findByIdAndUpdate(id, { isDeleted: false });
    res.status(201).json({ success: true, message: "Done" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/addRequest", async (req, res) => {
  try {
    const { organization, community, volunteer } = req.body;
    const exist = await CommunityRequest.findOne({
      organization,
      volunteer,
      community,
      status: "Pending",
    });
    if (exist) {
      return res.status(202).json({ success: false, message: "Request exist" });
    }
    await CommunityRequest.create({
      organization: organization,
      volunteer,
      community,
    });
    res.status(201).json({ success: true, message: "Request Added" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/our/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let communities = await Community.find({
      org: id,
      isDeleted: false,
    }).lean();
    for (let i = 0; i < communities.length; i++) {
      communities[i].value =
        (communities[i].volunteers.length / communities[i].allowed) * 100;
      let requests = await CommunityRequest.find({
        community: communities[i]._id,
        status: "Pending",
        isDeleted: false,
      }).countDocuments();
      communities[i].requests = requests;
    }
    res.status(201).json({ success: true, communities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/requests/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let communitiesRequests = await CommunityRequest.find({
      community: id,
      isDeleted: false,
      status: "Pending",
    }).populate("volunteer");
    res.status(201).json({ success: true, communitiesRequests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/requestsO/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let communitiesRequests = await CommunityRequest.find({
      organization: id,
      isDeleted: false,
      status: "Pending",
    }).populate("volunteer");
    res.status(201).json({ success: true, communitiesRequests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/members/:id", async (req, res) => {
  try {
    const communityId = req.params.id;
    const community = await Community.findById(communityId).populate(
      "volunteers"
    );
    res.status(201).json({ success: true, volunteers: community.volunteers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/deleteMember/:community/:volunteer", async (req, res) => {
  try {
    const { community, volunteer } = req.params;
    await Community.findByIdAndUpdate(community, {
      $pull: { volunteers: volunteer },
    });
    res.status(201).json({ success: true, message: "Delete Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/decideRequest/:id", async (req, res) => {
  try {
    const requestid = req.params.id;
    const decision = req.body.decision;
    const request = await CommunityRequest.findByIdAndUpdate(
      requestid,
      { status: decision },
      { new: true }
    );
    const user = await User.findById(request.volunteer);
    const community = await Community.findOne({ _id: request.community });
    if (decision == "Accepted")
      await Community.findByIdAndUpdate(request.community, {
        $addToSet: { volunteers: request.volunteer },
      });
    const subject = "Community Request Accepted";
    let body = `<p>Your request for Community ${community.title} accepted </p>`;
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
        res.status(201).json({ success: true, message: "Decision Done" });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
