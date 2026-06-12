const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: String, // Matches User's uid
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: "My Resume"
  },
  templateId: {
    type: String,
    required: true,
    default: "modern"
  },
  personalInfo: {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    summary: { type: String, default: "" }
  },
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    startYear: String,
    endYear: String,
    gpa: String
  }],
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  skills: {
    type: [String],
    default: []
  },
  projects: [{
    title: String,
    description: String,
    technologies: String,
    link: String
  }],
  certifications: [{
    name: String,
    issuingOrg: String,
    issueDate: String,
    credentialUrl: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
ResumeSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Resume", ResumeSchema);
