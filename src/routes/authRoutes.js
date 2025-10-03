// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin, // ✅ add google login controller
} from "../controllers/authController.js";

const router = express.Router();

// Local signup + login
router.post("/register", registerUser); // signup
router.post("/login", loginUser);       // login

// Google OAuth login
router.post("/google", googleLogin);    // ✅ handle google login in controller

export default router;
