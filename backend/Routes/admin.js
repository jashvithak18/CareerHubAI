const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const Resume = require("../Model/Resume");
const Job = require("../Model/Job");
const Internship = require("../Model/Internship");
const Application = require("../Model/Application");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const adminuser = "admin";
const adminpass = "admin";

// Authenticate administrative user
router.post("/adminlogin", (req, res) => {
  const { username, password } = req.body;
  if (username === adminuser && password === adminpass) {
    const token = jwt.sign(
      { 
        uid: "admin", 
        email: "admin@internarea.com", 
        role: "admin" 
      },
      process.env.JWT_SECRET || "supersecret_admin_key_12345",
      { expiresIn: "7d" }
    );
    res.status(200).json({ success: true, token, role: "admin" });
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid credentials" });
  }
});

// Protected: Retrieve platform metrics for dashboard widgets
router.get("/stats", verifyToken, requireRole(["admin"]), async (req, res) => {
  try {
    const totalResumes = await Resume.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalInternships = await Internship.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    // Aggregation of user metrics
    const users = await User.find({}, "plan atsChecksThisMonth");
    let totalAtsChecks = 0;
    let freeUsers = 0;
    let proUsers = 0;
    
    users.forEach(u => {
      totalAtsChecks += u.atsChecksThisMonth || 0;
      if (u.plan === "pro") {
        proUsers++;
      } else {
        freeUsers++;
      }
    });

    res.status(200).json({
      totalResumes,
      totalJobs,
      totalInternships,
      totalApplications,
      totalAtsChecks,
      freeUsers,
      proUsers,
      totalUsers: users.length
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
