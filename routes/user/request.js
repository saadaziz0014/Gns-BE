const BeneficiaryRequest = require("../../models/BeneficiaryRequest");

const router = require("express").Router();

router.post("/makeRequest", async (req, res) => {
    try {
        const { beneficiary, benefactor, message, category } = req.body;
        await BeneficiaryRequest.create({ benefactor, beneficiary, message, category });
        res.status(201).json({ success: true, message: "Request Added" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/viewRequests/:benefactorId", async (req, res) => {
    try {
        const benefactor = req.params.benefactorId;
        const allRequests = await BeneficiaryRequest.find({ benefactor }).populate('beneficiary');
        res.status(201).json({ success: true, allRequests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/decideRequest/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const decision = req.query.decision;
        await BeneficiaryRequest.findByIdAndUpdate(id, { status: decision });
        res.status(201).json({ success: true, message: "Done" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/detailedRequest/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const request = await BeneficiaryRequest.findById(id);
        res.status(201).json({ success: true, request })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/myRequests/:beneficiaryId", async (req, res) => {
    try {
        const beneficiary = req.params.beneficiaryId;
        const requests = await BeneficiaryRequest.find({ beneficiary }).populate('benefactor');
        res.status(201).json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

router.get("/deleteRequest/:id", async (req, res) => {
    try {
        const requestId = req.params.id;
        await BeneficiaryRequest.deleteOne({ _id: requestId, status: "Pending" })
        res.status(201).json({ success: true, message: "Request Deleted" })
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() })
    }
})

module.exports = router;