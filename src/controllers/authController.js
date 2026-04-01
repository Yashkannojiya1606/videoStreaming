
// today code 04122025


import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ---------------------------------------------
   LOCAL REGISTER
---------------------------------------------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, dob } = req.body;

    if (!name || !email || !password || !dob) {
      return res.status(400).json({ message: "name, email, password and dob are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
      dob,
      authProvider: "local",
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        dob: newUser.dob,
        avatar: newUser.avatar,
        username: newUser.username,
      },
      token,
    });
  } catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   LOCAL LOGIN
---------------------------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "This account is registered with Google. Please use Google login.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        avatar: user.avatar,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------------
   GOOGLE LOGIN
---------------------------------------------- */
// export const googleLogin = async (req, res) => {
//   try {
//     const { id_token } = req.body;
//     if (!id_token)
//       return res.status(400).json({ message: "Missing Google ID Token" });

//     // Verify token
//     const ticket = await client.verifyIdToken({
//       idToken: id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, name, picture, sub } = payload;

//     if (!email)
//       return res.status(400).json({ message: "Email required" });

//     let user = await User.findOne({ email });

//     // Create if new
//     if (!user) {
//       user = await User.create({
//         name,
//         email,
//         password: null,
//         username: email.split("@")[0],
//         avatar: picture,
//         authProvider: "google",
//         googleId: sub,
//       });
//     }

//     // Create JWT
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET || "dev_secret",
//       { expiresIn: "7d" }
//     );

//     res.json({
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         username: user.username,
//       },
//     });
//   } catch (error) {
//     console.error("googleLogin error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// update 02/04 by yash 
export const googleLogin = async (reqOrToken, res = null) => {
  try {
    // ✅ detect input type
    const id_token =
      typeof reqOrToken === "string"
        ? reqOrToken
        : reqOrToken.body?.id_token;

    if (!id_token) {
      if (res)
        return res.status(400).json({ message: "Missing Google ID Token" });
      return null;
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    if (!email) {
      if (res)
        return res.status(400).json({ message: "Email required" });
      return null;
    }

    let user = await User.findOne({ email });

    // Create if new
    if (!user) {
      user = await User.create({
        name,
        email,
        password: null,
        username: email.split("@")[0],
        avatar: picture,
        authProvider: "google",
        googleId: sub,
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    const result = {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        username: user.username,
      },
    };

    // ✅ if API call
    if (res) {
      return res.json(result);
    }

    // ✅ if direct call
    return result;
  } catch (error) {
    console.error("googleLogin error:", error);

    if (res) {
      return res.status(500).json({ error: error.message });
    }

    return null;
  }
};
         