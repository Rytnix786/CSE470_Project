const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = requireAuth;
