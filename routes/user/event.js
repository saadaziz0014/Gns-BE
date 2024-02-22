const Community = require("../../models/Community");
const Event = require("../../models/Event");
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
    const { community, purpose, date } = req.body;
    const exist = await Event.findOne({
      purpose: { $regex: purpose, $options: "i" },
      community,
      isDeleted: false,
    });
    if (exist) {
      return res.status(202).json({ success: false, message: "Exist with Same Puropose" });
    }
    await Event.create({ community, purpose, date });
    res.status(201).json({ success: true, message: "Event Added" });
  } catch (error) {
    console.log(error)
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

router.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Event.findByIdAndUpdate(id, { isDeleted: true });
    res.status(201).json({ success: true, message: "Done" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});



router.get("/mail/:communityId/:eventId", async (req, res) => {
  try {
    const community = req.params.communityId;
    const event = req.params.eventId;
    let currentDate = new Date();
    let eventE = await Event.findById(event);
    let eventDate = new Date(eventE.date);
    if (currentDate > eventDate) {
      return res.status(202).json({ success: false, message: "Event Date Passed" })
    }
    let communityE = await Community.findById(community).populate("org");
    for (let i = 0; i < communityE.volunteers.length; i++) {
      let user = await User.findById(communityE.volunteers[i]);
      const subject = "New Event Added";
      let body = `<p>Dear <strong>${user.name}</strong>,</p> <br/> <p> new Event on <strong>${eventE.purpose}</strong> by <strong>${communityE.org.name}</strong> on ${eventE.date}</p>`;
      const mailOptions = {
        from: `${process.env.MAIL_SENDER_NAME} <${process.env.MAIL_SENDER_EMAIL}>`,
        to: user.email,
        subject: subject,
        html: body,
      };

      await transporter.sendMail(mailOptions)
    }
    res.status(201).json({ message: "Mail Sent" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const community = req.params.id;
    let currentDate = new Date();
    let events = await Event.find({ community, isDeleted: false }).lean();
    events = events.filter((event) => {
      let eventDate = new Date(event.date);
      return eventDate > currentDate
    })
    res.status(201).json({ success: true, events })
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() })
  }
})

router.get("/community/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let events = await Event.find({
      community: id,
      isDeleted: false,
    });
    res.status(201).json({ success: true, events });
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

router.post("/decideRequest/:id", async (req, res) => {
  try {
    const requestid = req.params.id;
    const decision = req.body.decision;
    const request = await CommunityRequest.findByIdAndUpdate(
      requestid,
      { status: decision },
      { new: true }
    );
    if (decision == "Accepted")
      await Community.findByIdAndUpdate(request.community, {
        $addToSet: { volunteers: request.volunteer },
      });
    res.status(201).json({ success: true, message: "Decision Done" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
