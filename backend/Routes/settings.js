const express = require("express");
const router = express.Router();
const Settings = require("../Model/Settings");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Public: Retrieve the payment details (UPI ID and Base64 QR code)
router.get("/payment-details", async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "payment_settings" });
    if (!settings) {
      // Return placeholder defaults if not configured
      settings = {
        upiId: "payment@upi",
        qrCode: ""
      };
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error retrieving payment settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Save or update the UPI ID and Base64 QR code
router.post("/payment-details", verifyToken, requireRole(["admin"]), async (req, res) => {
  const { upiId, qrCode } = req.body;

  if (!upiId || !upiId.trim()) {
    return res.status(400).json({ error: "UPI ID is required" });
  }
  if (!qrCode) {
    return res.status(400).json({ error: "QR code image is required" });
  }

  try {
    let settings = await Settings.findOne({ key: "payment_settings" });
    if (settings) {
      settings.upiId = upiId.trim();
      settings.qrCode = qrCode;
      await settings.save();
    } else {
      settings = new Settings({
        key: "payment_settings",
        upiId: upiId.trim(),
        qrCode: qrCode
      });
      await settings.save();
    }
    res.status(200).json({ success: true, message: "Payment settings updated successfully", settings });
  } catch (error) {
    console.error("Error updating payment settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
