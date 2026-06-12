const express = require("express");
const router = express.Router();
const Internship = require("../Model/Internship");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Protected: Only admins can post internships
router.post("/", verifyToken, requireRole(["admin"]), async (req, res) => {
  // Convert comma-separated perks string into an array if necessary
  let perksArray = req.body.perks;
  if (typeof perksArray === "string") {
    perksArray = perksArray.split(",").map(p => p.trim()).filter(Boolean);
  }

  const Internshipdata = new Internship({
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    category: req.body.category,
    aboutCompany: req.body.aboutCompany,
    aboutInternship: req.body.aboutInternship,
    whoCanApply: req.body.whoCanApply,
    perks: perksArray,
    numberOfOpening: req.body.numberOfOpening,
    stipend: req.body.stipend,
    startDate: req.body.startDate,
    additionalInfo: req.body.additionalInfo,
  });

  try {
    const data = await Internshipdata.save();
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating internship:", error);
    res.status(500).json({ error: "failed to create internship" });
  }
});

// Public: Retrieve all internships
router.get("/", async (req, res) => {
  try {
    const data = await Internship.find();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Public: Retrieve internship by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Internship.findById(id);
    if (!data) {
      return res.status(404).json({ error: "internship not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
