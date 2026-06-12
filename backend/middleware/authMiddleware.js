const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");

// Initialize Firebase Admin SDK
if (admin.getApps().length === 0) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "careerhubai"
  });
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access Denied: No Token Provided" });
  }

  const token = authHeader.split(" ")[1];

  // 1. Try to verify as local admin JWT first
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret_admin_key_12345");
    if (decoded && decoded.role === "admin") {
      req.user = decoded;
      return next();
    }
  } catch (err) {
    // Not a local admin JWT, ignore error and try Firebase token
  }

  // 2. Try to verify as Firebase ID Token
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Look up user in MongoDB to get their role
    const dbUser = await User.findOne({ uid: decodedToken.uid });
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split("@")[0],
      role: dbUser ? dbUser.role : "student" // Default to student if not registered
    };
    
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(401).json({ error: "Access Denied: Invalid Token" });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Access Denied" });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
