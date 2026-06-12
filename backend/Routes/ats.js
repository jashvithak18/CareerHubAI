const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const Resume = require("../Model/Resume");
const { verifyToken } = require("../middleware/authMiddleware");

// Stopwords helper to filter out common English articles/prepositions
const STOPWORDS = new Set([
  "the", "and", "a", "an", "of", "to", "for", "in", "is", "on", "at", "by", 
  "from", "with", "this", "that", "it", "are", "be", "as", "or", "our", "your", 
  "my", "i", "we", "you", "they", "he", "she", "has", "have", "had", "will", 
  "would", "should", "can", "could", "about", "been", "was", "were", "but"
]);

// Helper to tokenize and clean text
const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // replace punctuation with spaces
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length > 2 && !STOPWORDS.has(word));
};

router.post("/check", verifyToken, async (req, res) => {
  const { resumeId, resumeText, jobDescription } = req.body;

  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({ error: "Job description is required" });
  }

  try {
    // 1. Fetch and update user limits
    const dbUser = await User.findOne({ uid: req.user.uid });
    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPro = dbUser.plan === "pro";

    if (!isPro) {
      const now = new Date();
      const resetDate = new Date(dbUser.lastAtsCheckReset);

      // Check if it's a new month to reset limits
      if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
        dbUser.atsChecksThisMonth = 0;
        dbUser.lastAtsCheckReset = now;
      }

      if (dbUser.atsChecksThisMonth >= 3) {
        return res.status(403).json({
          error: "Limit Reached: Free accounts are limited to 3 ATS checks per month. Upgrade to Pro for unlimited checks.",
          upgradeRequired: true
        });
      }
    }

    // 2. Extract Resume Content
    let textToAnalyze = resumeText || "";

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user.uid });
      if (resume) {
        // Concatenate text sections to formulate resume text
        const sections = [
          resume.title,
          resume.personalInfo?.summary,
          resume.skills.join(" "),
          resume.experience.map(exp => `${exp.position} ${exp.company} ${exp.description}`).join(" "),
          resume.education.map(edu => `${edu.degree} ${edu.fieldOfStudy} ${edu.school}`).join(" "),
          resume.projects.map(proj => `${proj.title} ${proj.description} ${proj.technologies}`).join(" "),
          resume.certifications.map(cert => `${cert.name} ${cert.issuingOrg}`).join(" ")
        ];
        textToAnalyze += " " + sections.filter(Boolean).join(" ");
      }
    }

    if (!textToAnalyze.trim()) {
      return res.status(400).json({ error: "No resume text found to check" });
    }

    // 3. Process ATS overlapping score
    const resumeTokens = new Set(tokenize(textToAnalyze));
    const jobTokens = tokenize(jobDescription);
    const uniqueJobTokens = Array.from(new Set(jobTokens));

    if (uniqueJobTokens.length === 0) {
      return res.status(400).json({ error: "Could not extract keywords from Job Description" });
    }

    // Identify matches and misses
    const matchedKeywords = [];
    const missingKeywords = [];

    uniqueJobTokens.forEach(token => {
      if (resumeTokens.has(token)) {
        matchedKeywords.push(token);
      } else {
        missingKeywords.push(token);
      }
    });

    const score = Math.round((matchedKeywords.length / uniqueJobTokens.length) * 100);

    // Formulate suggestions
    let recommendation = "";
    if (score < 40) {
      recommendation = "Low match score. We recommend adding more relevant key skills, project descriptions, and custom summaries matching the job requirements.";
    } else if (score < 70) {
      recommendation = `Good start, but missing some key terms. Try incorporating skills like: ${missingKeywords.slice(0, 5).join(", ")} into your experience or skills section.`;
    } else {
      recommendation = "Excellent match! Your profile has high relevance. You are ready to apply for this role.";
    }

    // 4. Increment check counter if Free tier
    if (!isPro) {
      dbUser.atsChecksThisMonth += 1;
      await dbUser.save();
    }

    res.status(200).json({
      score,
      matchedKeywords: matchedKeywords.slice(0, 15),
      missingKeywords: missingKeywords.slice(0, 15),
      recommendation,
      remainingChecks: isPro ? "Unlimited" : Math.max(0, 3 - dbUser.atsChecksThisMonth),
      plan: dbUser.plan
    });

  } catch (error) {
    console.error("ATS checking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
