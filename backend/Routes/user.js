const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const { verifyToken } = require("../middleware/authMiddleware");

// Sync authenticated user details with MongoDB
router.post("/sync", verifyToken, async (req, res) => {
  const { uid, email, name } = req.user;
  const { photo } = req.body;

  // Safety guard: uid must be present to avoid validation failure
  if (!uid) {
    console.error("User sync rejected: uid is missing from token payload", req.user);
    return res.status(400).json({ error: "Invalid token: uid not found in token payload" });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({ $or: [{ uid }, { email }] });
    } else {
      user = await User.findOne({ uid });
    }

    if (user) {
      // Update existing record if details changed or if updating to new firebase project uid
      user.uid = uid;
      user.name = name || user.name;
      user.email = email || user.email;
      if (photo) {
        user.photo = photo;
      }
      await user.save();
      return res.status(200).json({ success: true, message: "User details synced", user });
    } else {
      // Create new user record
      user = new User({
        uid,
        name: name || (email ? email.split("@")[0] : "User"),
        email,
        photo: photo || "",
        role: "student" // Default to student
      });
      await user.save();
      return res.status(201).json({ success: true, message: "User registered in DB", user });
    }
  } catch (error) {
    console.error("User Sync Error:", error);
    if (global.logError) {
      global.logError("User Sync", error);
    }
    return res.status(500).json({ 
      error: "Internal Server Error during user sync", 
      message: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
