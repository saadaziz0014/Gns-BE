const { default: mongoose } = require("mongoose");
const Category = require("../../models/Category");

const router = require("express").Router();

router.post("/add", async (req, res) => {
  try {
    const name = req.body.name;
    await Category.create({ name });
    res.status(201).json({ success: true, message: "Category Added" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/all", async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.status(201).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/toogleDelete/:id", async (req, res) => {
  try {
    const categoryId = new mongoose.Types.ObjectId(req.params.id);
    const category = await Category.findById(categoryId);
    category.isDeleted == true
      ? await Category.findByIdAndUpdate(categoryId, { isDeleted: false })
      : await Category.findByIdAndUpdate(categoryId, { isDeleted: true });
    res.status(201).json({ success: true, message: "Action Done" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.get("/adminAll", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(201).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/update/:id", async (req, res) => {
  try {
    const categoryId = new mongoose.Types.ObjectId(req.params.id);
    const name = req.body.name;
    await Category.findByIdAndUpdate(categoryId, { name });
    res.status(201).json({ success: true, message: "Updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
