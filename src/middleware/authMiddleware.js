





// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   try {
//     let token = null;

//     if (req.headers.authorization?.startsWith("Bearer ")) {
//       token = req.headers.authorization.split(" ")[1];
//     } else if (req.cookies?.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - No token provided",
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     let user = decoded;

//     // If decoded does not contain username, fetch user from DB
//     if (!decoded.username) {
//       user = await User.findById(decoded.id).select("username email avatar");
//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: "User not found",
//         });
//       }
//     }

//     // 🔥 FIX: ALWAYS give routes a consistent user.id
//     user.id = user.id || user._id;

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("🔒 Auth error:", err.message);

//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }
// };


// cors error fix after failure 










import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

  if (!token) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");

  return res.status(401).json({
    success: false,
    message: "Unauthorized - No token provided",
  });
}


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = decoded;

    // If decoded does not contain username, fetch user from DB
    if (!decoded.username) {
      user = await User.findById(decoded.id).select("username email avatar");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
    }

    // 🔥 FIX: ALWAYS give routes a consistent user.id
    user.id = user.id || user._id;

    req.user = user;
    next();
  } 
  catch (err) {
  console.error("🔒 Auth error:", err.message);

  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");

  return res.status(401).json({
    success: false,
    message: "Invalid or expired token",
  });
}

};