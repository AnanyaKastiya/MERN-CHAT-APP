const jwt = require("jsonwebtoken");
const User = require("../Models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const parts = req.headers.authorization.split(" ");
      if (parts.length !== 2 || !parts[1]) {
        res.status(401);
        throw new Error("Malformed authorization header");
      }

      const token = parts[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.id) {
        res.status(401);
        throw new Error("Invalid token payload");
      }

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Auth error:", error);
      }

      if (error.name === "TokenExpiredError") {
        res.status(401);
        throw new Error("Token expired, please login again");
      }

      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
