// Backend/middlewares/auth.middleware.js
const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
const CaptainModel = require("../models/captain.model");

module.exports.authUser = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookie or Authorization header
    let token;
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 2️⃣ Check blacklist
    const blacklisted = await blacklistTokenModel.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user to request
    const user = await userModel.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message); // helpful in dev
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports.authCaptain = async (req, res, next) => {
  try {
    const token = req.cookies?.token || 
      (req.headers.authorization?.startsWith("Bearer ") 
        ? req.headers.authorization.split(" ")[1] 
        : null);
        //console.log("Received token:", token);

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const blacklisted = await blacklistTokenModel.findOne({ token });
    if (blacklisted) {
      console.log("Token is blacklisted");
      return res.status(401).json({ message: "Token has been revoked" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await CaptainModel.findById(decoded._id).select("-password");

    if (!captain) {
      console.log("Captain not found for token:", decoded._id);
      return res.status(401).json({ message: "Captain not found" });
    }

    //console.log("Captain attached:", captain._id);
    req.captain = captain;
    next();

  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};
