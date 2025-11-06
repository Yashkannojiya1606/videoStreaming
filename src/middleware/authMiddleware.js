// // import jwt from "jsonwebtoken";

// // export const protect = (req, res, next) => {
// //   const token = req.headers.authorization?.split(" ")[1];
// //   if (!token) return res.status(401).json({ message: "Not authorized, no token" });

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     req.user = decoded;
// //     next();
// //   } catch (err) {
// //     res.status(401).json({ message: "Invalid token" });
// //   }
// // };




// import jwt from "jsonwebtoken";
// import User from "../models/User.js"; // ✅ to fetch user details if needed

// export const protect = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Not authorized, no token" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // decoded might only have { id: ... } depending on how you signed it
//     let user = decoded;

//     // If token only contains user ID, fetch full user info
//     if (!decoded.username) {
//       user = await User.findById(decoded.id).select("username avatar");
//     }

//     if (!user) return res.status(401).json({ message: "User not found" });

//     req.user = user; // ✅ attach user info for controllers
//     next();
//   } catch (err) {
//     console.error("Auth error:", err);
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };


import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // 1️⃣ Extract token from header or cookie
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    // 2️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Fetch full user only if needed
    let user = decoded;
    if (!decoded.username) {
      user = await User.findById(decoded.id).select("username email avatar");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
    }

    // 4️⃣ Attach user to request
    req.user = user;

    // 5️⃣ Continue to next middleware
    next();
  } catch (err) {
    console.error("🔒 Auth error:", err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: err.message,
    });
  }
};
