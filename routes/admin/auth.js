const router = require("express").Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email == process.env.ADMIN_EMAIL &&
      password == process.env.ADMIN_PASS
    ) {
      return res.status(201).json({ success: true, data: { role: "admin" } });
    }
    res.status(202).json({ success: false, message: "Invalid Credentials" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
