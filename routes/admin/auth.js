const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const router = require("express").Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const superAdmin = await User.findOne({
      email: { $regex: email, $options: "i" },
    });
    if (!superAdmin) {
      return res
        .status(202)
        .json({ success: false, message: "Invalid Credentials" });
    }
    let compare = bcrypt.compare(password, superAdmin.password);
    if (compare) {
      return res
        .status(201)
        .json({ success: true, data: { role: "superAdmin" } });
    }
    res.status(202).json({ success: false, message: "Invalid Password" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
