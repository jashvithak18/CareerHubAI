const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: "payment_settings"
  },
  upiId: {
    type: String,
    required: true,
    default: ""
  },
  qrCode: {
    type: String, // Base64 representation of QR image
    required: true,
    default: ""
  }
});

module.exports = mongoose.model("Settings", SettingsSchema);
