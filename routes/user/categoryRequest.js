const CategoryRequest = require("../../models/CategoryRequest");

const router = require("express").Router();

router.post("/add", async (req, res) => {
    try {
        const { id, name } = req.body;
        await CategoryRequest.create({ beneficiary: id, category: name });
        res.status(201).json({ success: true, message: "Request Added" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/all", async (req, res) => {
    try {
        let catReq = await CategoryRequest.find().populate('beneficiary');
        res.status(201).json({ success: true, catReq })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})


module.exports = router;