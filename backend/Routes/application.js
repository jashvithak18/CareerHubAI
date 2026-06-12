const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Protected: Post a new application (Student only)
router.post("/", verifyToken, async (req, res) => {
  const { uid, email, name } = req.user;
  
  const applicationipdata = new application({
    company: req.body.company,
    category: req.body.category,
    coverLetter: req.body.coverLetter,
    user: {
      uid: uid,
      email: email,
      name: name,
      photo: req.body.user?.photo || ""
    },
    Application: req.body.Application, // ID of job/internship
    availability: req.body.availability
  });

  try {
    const data = await applicationipdata.save();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ error: "failed to submit application" });
  }
});

// Protected: Get all applications (Admin gets all, Student gets only their own)
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      query = { "user.uid": req.user.uid };
    }
    const data = await application.find(query);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Protected: Get application by ID (Owner student or Admin only)
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const data = await application.findById(id);
    if (!data) {
      return res.status(404).json({ error: "application not found" });
    }

    // Access control check: Must be admin or owner of the application
    if (req.user.role !== "admin" && data.user.uid !== req.user.uid) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Protected: Update application status (Admin only)
router.put("/:id", verifyToken, requireRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  let status;

  if (action === "accepted") {
    status = "accepted";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    const updateapplication = await application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updateapplication) {
      return res.status(404).json({ error: "Not able to update the application" });
    }
    res.status(200).json({ success: true, data: updateapplication });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
