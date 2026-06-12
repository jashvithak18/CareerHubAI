const express = require("express");
const router = express.Router();
const Resume = require("../Model/Resume");
const User = require("../Model/User");
const { verifyToken } = require("../middleware/authMiddleware");

// Retrieve all resumes of the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.uid }).sort({ updatedAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    if (global.logError) {
      global.logError("Fetch Resumes", error);
    }
    res.status(500).json({ error: "Internal server error", message: error.message, stack: error.stack });
  }
});

// Retrieve a specific resume by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.status(200).json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new resume (enforces subscription limits)
router.post("/", verifyToken, async (req, res) => {
  try {
    const dbUser = await User.findOne({ uid: req.user.uid });
    const isPro = dbUser && dbUser.plan === "pro";

    if (!isPro) {
      // Check count of existing resumes for free users
      const count = await Resume.countDocuments({ userId: req.user.uid });
      if (count >= 1) {
        return res.status(403).json({
          error: "Limit Reached: Free users are limited to 1 resume. Upgrade to Pro for unlimited resumes.",
          upgradeRequired: true
        });
      }
    }

    const newResume = new Resume({
      userId: req.user.uid,
      title: req.body.title || "My Resume",
      templateId: req.body.templateId || "modern",
      personalInfo: req.body.personalInfo || {},
      education: req.body.education || [],
      experience: req.body.experience || [],
      skills: req.body.skills || [],
      projects: req.body.projects || [],
      certifications: req.body.certifications || []
    });

    const savedResume = await newResume.save();
    res.status(201).json(savedResume);
  } catch (error) {
    console.error("Error creating resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a resume
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      {
        $set: {
          title: req.body.title,
          templateId: req.body.templateId,
          personalInfo: req.body.personalInfo,
          education: req.body.education,
          experience: req.body.experience,
          skills: req.body.skills,
          projects: req.body.projects,
          certifications: req.body.certifications,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.status(200).json(resume);
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a resume
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const result = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!result) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
