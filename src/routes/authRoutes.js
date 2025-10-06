// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

// Local signup + login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth routes
router.get("/google", (req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile%20email&access_type=offline`;
  
  console.log('Redirecting to:', redirectUrl);
  res.redirect(redirectUrl);
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }

    console.log('Google authorization code received:', code);
    
    // Redirect to frontend with success message
    res.redirect(`${process.env.CLIENT_URL}?googleAuth=success&code=${code}`);
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}?googleAuth=error`);
  }
});

router.post("/google", googleLogin);

export default router;