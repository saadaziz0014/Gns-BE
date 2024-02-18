const Contact = require("../../models/Contact");

const router = require("express").Router();

router.post("/", async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNo, message } = req.body;
        await Contact.create({ firstName, lastName, email, phoneNo, message });
        res.status(201).json({ success: true, message: "Saved" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error.toString() })
    }
})

module.exports = router;