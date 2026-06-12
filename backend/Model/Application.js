const mongoose = require("mongoose");

const Applicationipschema = new mongoose.Schema({
  company: String,
  category: String,
  coverLetter: String,
  user: {
    uid: { type: String, required: true },
    name: String,
    email: String,
    photo: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
  Application: String, // Keep the job/internship ID as string reference
  availability: String, // Save the availability details submitted by students
  resumePdf: String, // Base64 encoded PDF resume
});

module.exports = mongoose.model("Application", Applicationipschema);
