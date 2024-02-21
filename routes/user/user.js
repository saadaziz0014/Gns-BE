const User = require("../../models/User");
const City = require("../../models/City");

const router = require("express").Router();

router.get("/my/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("categories");
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/about/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { about, contact, name, location } = req.body;
    const user = await User.findByIdAndUpdate(id, { about, contact, name, location });
    res.status(201).json({ success: true, message: "About Updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});



router.post("/addCategory", async (req, res) => {
  try {
    const { category, userId } = req.body;
    await User.findByIdAndUpdate(userId, {
      $addToSet: { categories: category },
    });
    res.status(201).json({ success: true, message: "Category Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/removeCategory", async (req, res) => {
  try {
    const { category, userId } = req.body;
    await User.findByIdAndUpdate(userId, {
      $pull: { categories: category },
    });
    res.status(201).json({ success: true, message: "Category Removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/city/loadCities", async (req, res) => {
  try {
    const cities = await City.find({ country: "PK" });
    res.status(201).json({ success: true, cities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;