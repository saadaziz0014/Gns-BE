const DonationRequest = require("../../models/DonationRequest");
const DonationRequestBen = require("../../models/DonationRequestBen");

const router = require("express").Router();

router.get("/all", async (req, res) => {
    try {
        const donations = await DonationRequest.find({ status: "Pending" }).populate('beneficiary');
        res.status(201).json({ success: true, donations })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
});

router.post("/addAmount/:id", async (req, res) => {
    try {
        const { amount } = req.body;
        const id = req.params.id;
        const donation = await DonationRequest.findById(id);
        if (amount >= donation.amountRequired) {
            await DonationRequest.findByIdAndUpdate(id, { status: "Completed", $inc: { amount, amountRequired: -amount } })
        }
        else {
            await DonationRequest.findByIdAndUpdate(id, { $inc: { amount, amountRequired: -amount } })
        }
        res.status(201).json({ success: true, message: "Done" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/allBen", async (req, res) => {
    try {
        let requests = await DonationRequestBen.find().populate('beneficiary benefactor');
        res.status(201).json({ success: true, requests })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/makeVerify/:id", async (req, res) => {
    try {
        const reqId = req.params.id;
        await DonationRequestBen.findByIdAndUpdate(reqId, { status: "Verified" });
        res.status(201).json({ success: true, message: "Verified" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/sendAmount/:id", async (req, res) => {
    try {
        const reqId = req.params.id;
        await DonationRequestBen.findByIdAndUpdate(reqId, { status: "Completed" });
        res.status(201).json({ success: true, message: "Send" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

module.exports = router;