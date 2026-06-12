const express = require("express");
const router = express.Router();
const Job = require("../Model/Job");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Protected: Only admins can post jobs
router.post("/", verifyToken, requireRole(["admin"]), async (req, res) => {
  // Convert comma-separated perks string into an array if necessary
  let perksArray = req.body.perks;
  if (typeof perksArray === "string") {
    perksArray = perksArray.split(",").map(p => p.trim()).filter(Boolean);
  }

  const jobdata = new Job({
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    Experience: req.body.Experience,
    category: req.body.category,
    aboutCompany: req.body.aboutCompany,
    aboutJob: req.body.aboutJob,
    whoCanApply: req.body.whoCanApply,
    perks: perksArray,
    AdditionalInfo: req.body.AdditionalInfo,
    CTC: req.body.CTC,
    StartDate: req.body.StartDate,
  });

  try {
    const data = await jobdata.save();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: "failed to create job" });
  }
});

// Public: Retrieve all jobs
router.get("/", async (req, res) => {
  try {
    const data = await Job.find();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Public: Retrieve job by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Job.findById(id);
    if (!data) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;