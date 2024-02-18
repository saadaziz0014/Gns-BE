const DonationRequest = require("../../models/DonationRequest");

const router = require("express").Router();

router.post("/makeRequest", async (req, res) => {
    try {
        const { beneficiary, message, title, amountRequired } = req.body;
        await DonationRequest.create({ beneficiary, message, title, amountRequired });
        res.status(201).json({ success: true, message: "Request Added" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/viewRequests", async (req, res) => {
    try {
        const allRequests = await DonationRequest.find({ status: "Pending" });
        res.status(201).json({ success: true, allRequests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/detailedRequest/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const request = await DonationRequest.findById(id);
        res.status(201).json({ success: true, request })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/myRequests/:beneficiaryId", async (req, res) => {
    try {
        const beneficiary = req.params.beneficiaryId;
        const requests = await DonationRequest.find({ beneficiary });
        res.status(201).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/deleteRequest/:id", async (req, res) => {
    try {
        const requestId = req.params.id;
        await DonationRequest.deleteOne({ _id: requestId, status: "Pending" })
        res.status(201).json({ success: true, message: "Request Deleted" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

module.exports = router;