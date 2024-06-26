const { default: mongoose } = require("mongoose");
const User = require("../../models/User");
const Category = require("../../models/Category");
const Contact = require("../../models/Contact");
const BeneficiaryRequest = require("../../models/BeneficiaryRequest");
const DonationRequest = require("../../models/DonationRequest");

const router = require("express").Router();

router.get("/allBeneficiaries", async (req, res) => {
  try {
    const beneficiaries = await User.find({ role: "beneficiary", verify:true });
    res.status(201).json({ beneficiaries });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get("/allBeneficiariesU", async (req, res) => {
  try {
    const beneficiaries = await User.find({
      role: "beneficiary",
      status: "Active",
      verify:true
    });
    res.status(201).json({ beneficiaries });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get("/allOrganizations", async (req, res) => {
  try {
    const organizations = await User.find({ role: "organization", verify:true });
    res.status(201).json({ organizations });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get("/allOrganizationsU", async (req, res) => {
  try {
    let organizations = await User.find({
      role: "organization",
      status: "Active",
      verify:true
    }).lean();
    let cats = [];
    for (let i = 0; i < organizations.length; i++) {
      cats = [];
      for (let j = 1; j < organizations[i].categories.length; j++) {
        let cat = await Category.findOne({
          _id: organizations[i].categories[j]._id,
          isDeleted: false,
        });
        cats.push(cat.name);
      }
      organizations[i].cats = cats;
    }
    res.status(201).json({ organizations });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get("/allVolunteers", async (req, res) => {
  try {
    const volunteers = await User.find({ role: "volunteer",verify:true });
    res.status(201).json({ volunteers });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get("/allServices", async (req, res) => {
  try {
    let all = await User.find({
      status: "Active",
      $or: [{ role: "volunteer" }, { role: "organization" }],
      verify:true
    }).lean();
    let ratings = 0;
    let cats = [];
    for (let i = 0; i < all.length; i++) {
      cats = [];
      let sum = 0;
      if (!all[i].ratings || all[i].ratings.length == 0) {
        all[i].ratings = 0;
      } else {
        for (k = 0; k < all[i].ratings.length; k++) {
          sum += all[i].ratings[k].rating;
        }
        ratings = Math.ceil(sum / all[i].ratings.length);
        all[i].ratings = ratings;
      }
      for (let j = 1; j < all[i].categories.length; j++) {
        let cat = await Category.findOne({
          _id: all[i].categories[j]._id,
          isDeleted: false,
        });
        cats.push(cat.name);
      }
      all[i].cats = cats;
    }
    all.sort((a, b) => b.ratings - a.ratings);
    // console.log(all);
    res.status(201).json({ all });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.toString() });
  }
});

router.get("/allVolunteersU", async (req, res) => {
  try {
    let volunteers = await User.find({
      role: "volunteer",
      status: "Active",
      verify:true
    }).lean();
    let cats = [];
    for (let i = 0; i < volunteers.length; i++) {
      cats = [];
      for (let j = 1; j < volunteers[i].categories.length; j++) {
        let cat = await Category.findOne({
          _id: volunteers[i].categories[j]._id,
          isDeleted: false,
        });
        cats.push(cat.name);
      }
      volunteers[i].cats = cats;
    }
    res.status(201).json({ volunteers });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get("/toogleBlock/:id", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(userId);
    user.status == "Active"
      ? await User.findByIdAndUpdate(userId, { status: "Blocked" })
      : await User.findByIdAndUpdate(userId, { status: "Active" });
    res.status(201).json({ success: true, message: "Action Done" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/allComplaints", async (req, res) => {
  try {
    const complains = await Contact.find().sort({ createdAt: -1 });
    res.status(201).json({ success: true, complains });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/totalUser", async (req, res) => {
  try {
    let volunteers = await User.find({
      role: "volunteer",
      status: "Active",
      verify:true
    }).countDocuments();
    let organizations = await User.find({
      role: "organization",
      status: "Active",
      verify:true
    }).countDocuments();
    let beneficiaries = await User.find({
      role: "beneficiary",
      status: "Active",
      verify:true
    }).countDocuments();
    let admins = await User.find({
      role: "admin",
      status: "Active",
      verify:true
    }).countDocuments();
    res.status(201).json({
      success: true,
      data: { beneficiaries, organizations, volunteers, admins },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/totalRequests", async (req, res) => {
  try {
    let allReq = await BeneficiaryRequest.find().lean();
    let pendingReq = allReq.filter((req) => req.status == "Pending");
    pendingReq = pendingReq.length;
    let nonPendingReq = allReq.filter((req) => req.status != "Pending");
    nonPendingReq = nonPendingReq.length;
    let allDon = await DonationRequest.find().lean();
    let pendingDon = allDon.filter((don) => don.status == "Pending");
    pendingDon = pendingDon.length;
    let nonPendingDon = allDon.filter((don) => don.status != "Pending");
    nonPendingDon = nonPendingDon.length;
    res.status(201).json({
      success: true,
      data: { pendingReq, nonPendingReq, pendingDon, nonPendingDon },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString });
  }
});

router.get("/allUsers", async (req, res) => {
  try {
    let users = await User.find({status:"Active",verify:true});
    res.status(201).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/changeRole", async (req, res) => {
  try {
    const { id, role } = req.body;
    await User.findByIdAndUpdate(id, { role });
    res.status(201).json({ success: true, message: "Role Changed" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
