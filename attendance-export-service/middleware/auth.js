const jwt = require("jsonwebtoken");
const { createLogger } = require("../utils/logger");

const logger = createLogger("auth-middleware");
const JWT_SECRET =
  process.env.JWT_SECRET || "8e763807-6039-4dd0-9740-2284b9e632d3";

// Middleware to authenticate requests
const authenticateRequest = (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role || "user",
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Authentication token expired" });
    }

    res.status(401).json({ error: "Invalid authentication token" });
  }
};

// Middleware to authenticate admin requests
const authenticateAdmin = (req, res, next) => {
  authenticateRequest(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin privileges required" });
    }
    next();
  });
};

// Middleware to authenticate internal API requests
const authenticateInternalRequest = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.SYNC_API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  next();
};

module.exports = {
  authenticateRequest,
  authenticateAdmin,
  authenticateInternalRequest,
};