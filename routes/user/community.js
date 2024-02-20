const Community = require("../../models/Community");
const CommunityRequest = require("../../models/CommunityRequest");

const router = require("express").Router();

router.post("/add", async (req, res) => {
    try {
        const { org, title } = req.body;
        const exist = await Community.find({ title: { $regex: title, $options: 'i' }, isDeleted: false });
        if (exist) {
            return res.status(202).json({ success: false, message: "Title exist" })
        }
        await Community.create({ org, title });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.post("/addRequest", async (req, res) => {
    try {
        const { organization, community, volunteer } = req.body;
        const exist = await CommunityRequest.find({ organization, volunteer, community, isDeleted: false });
        if (exist) {
            return res.status(202).json({ success: false, message: "Title exist" })
        }
        await CommunityRequest.create({ organization, volunteer, community });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

module.exports = router;