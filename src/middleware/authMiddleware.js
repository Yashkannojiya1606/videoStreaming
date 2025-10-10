// import jwt from "jsonwebtoken";

// export const protect = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Not authorized, no token" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };




import jwt from "jsonwebtoken";
import User from "../models/User.js"; // ✅ to fetch user details if needed

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded might only have { id: ... } depending on how you signed it
    let user = decoded;

    // If token only contains user ID, fetch full user info
    if (!decoded.username) {
      user = await User.findById(decoded.id).select("username avatar");
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // ✅ attach user info for controllers
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
