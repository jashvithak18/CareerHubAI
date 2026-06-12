const express = require("express");
const router = express.Router();
const Payment = require("../Model/Payment");
const User = require("../Model/User");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Student: Request a subscription upgrade by submitting UTR and Base64 screenshot
router.post("/upgrade", verifyToken, async (req, res) => {
  const { screenshot, utr } = req.body;

  if (!screenshot) {
    return res.status(400).json({ error: "Screenshot is required" });
  }
  if (!utr || !utr.trim()) {
    return res.status(400).json({ error: "UTR transaction code is required" });
  }

  try {
    // Check if UTR is already submitted
    const existingPayment = await Payment.findOne({ utr: utr.trim() });
    if (existingPayment) {
      return res.status(400).json({ error: "This UTR transaction reference has already been submitted." });
    }

    const newPayment = new Payment({
      userId: req.user.uid,
      userEmail: req.user.email,
      userName: req.user.name,
      screenshot: screenshot,
      utr: utr.trim(),
      status: "pending"
    });

    await newPayment.save();
    res.status(201).json({ success: true, message: "Upgrade request submitted successfully. Pending verification." });

  } catch (error) {
    console.error("Upgrade request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Fetch all pending payment verification requests
router.get("/admin/pending", verifyToken, requireRole(["admin"]), async (req, res) => {
  try {
    const pendingRequests = await Payment.find({ status: "pending" }).sort({ createdAt: -1 });
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Approve or reject a subscription request
router.put("/admin/verify/:id", verifyToken, requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // "approved" or "rejected"

  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({ error: "Invalid action. Must be 'approved' or 'rejected'" });
  }

  try {
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ error: "Payment verification request not found" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ error: "This payment request has already been processed" });
    }

    if (action === "approved") {
      payment.status = "approved";
      await payment.save();

      // Upgrade student user profile plan to pro
      const student = await User.findOne({ uid: payment.userId });
      if (student) {
        student.plan = "pro";
        await student.save();
      }
      res.status(200).json({ success: true, message: "Payment approved. User has been upgraded to PRO.", payment });
    } else {
      payment.status = "rejected";
      await payment.save();
      res.status(200).json({ success: true, message: "Payment request rejected.", payment });
    }

  } catch (error) {
    console.error("Error verifying payment request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
