const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("../Model/User");

// Cache for Google's public certificates to verify RS256 Firebase ID token signatures
let publicKeysCache = null;
let cacheExpiry = 0;

const getFirebasePublicKeys = async () => {
  const now = Date.now();
  if (publicKeysCache && now < cacheExpiry) {
    return publicKeysCache;
  }

  // CORRECT endpoint for Firebase ID Token public keys
  const res = await axios.get(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
  );

  publicKeysCache = res.data;
  // Cache for 1 hour
  cacheExpiry = now + 60 * 60 * 1000;
  return publicKeysCache;
};

const verifyFirebaseToken = async (token) => {
  // Decode header to get key ID (kid)
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error("Invalid token: missing header or kid");
  }

  const kid = decoded.header.kid;
  const publicKeys = await getFirebasePublicKeys();
  const cert = publicKeys[kid];

  if (!cert) {
    // Invalidate cache so fresh keys are fetched next time
    publicKeysCache = null;
    throw new Error(`No matching certificate found for kid: ${kid}`);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "careerhubai";

  // Verify RS256 signature + audience + issuer
  const payload = jwt.verify(token, cert, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  return payload;
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access Denied: No Token Provided" });
  }

  const token = authHeader.split(" ")[1];

  // 1. Try admin JWT first (signed locally)
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecret_admin_key_12345"
    );
    if (decoded && decoded.role === "admin") {
      req.user = decoded;
      return next();
    }
  } catch (err) {
    // Not a local admin JWT — fall through to Firebase verification
  }

  // 2. Verify as Firebase ID Token
  try {
    const payload = await verifyFirebaseToken(token);

    const dbUser = await User.findOne({ uid: payload.uid });

    req.user = {
      uid: payload.uid,
      email: payload.email,
      name:
        payload.name ||
        (payload.email ? payload.email.split("@")[0] : "user"),
      role: dbUser ? dbUser.role : "student",
    };

    return next();
  } catch (error) {
    console.error("Firebase token verification failed:", error.message);
    return res.status(401).json({
      error: "Access Denied: Invalid Token",
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

module.exports = { verifyToken, requireRole };
