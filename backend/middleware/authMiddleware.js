const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../Model/User");

// Cache for Google's public certificates to verify RS256 signatures
let publicKeysCache = null;
let cacheExpiry = 0;

const getFirebasePublicKeys = async () => {
  const now = Date.now();
  if (publicKeysCache && now < cacheExpiry) {
    return publicKeysCache;
  }
  
  try {
    const res = await axios.get(
      "https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com"
    );
    publicKeysCache = res.data;
    // Cache for 6 hours
    cacheExpiry = now + 6 * 60 * 60 * 1000;
    return publicKeysCache;
  } catch (err) {
    console.error("Error fetching Google public certificates:", err.message);
    throw new Error("Failed to fetch public certificates for token verification");
  }
};

const verifyFirebaseToken = async (token) => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error("Invalid token format or missing key identifier (kid)");
  }

  const kid = decoded.header.kid;
  const publicKeys = await getFirebasePublicKeys();
  const cert = publicKeys[kid];
  if (!cert) {
    throw new Error("Matching public certificate not found for token");
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "careerhubai";

  // Verify signature, issuer, and audience claims
  const verifiedPayload = jwt.verify(token, cert, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`
  });

  return verifiedPayload;
};

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
    // Not a local admin JWT, ignore error and try Firebase token next
  }

  // 2. Verify as Firebase ID Token
  try {
    const decodedToken = await verifyFirebaseToken(token);
    
    // Look up user in MongoDB to check role
    const dbUser = await User.findOne({ uid: decodedToken.uid });
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || (decodedToken.email ? decodedToken.email.split("@")[0] : "user"),
      role: dbUser ? dbUser.role : "student"
    };
    
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(401).json({ 
      error: "Access Denied: Invalid Token", 
      details: error.message 
    });
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
