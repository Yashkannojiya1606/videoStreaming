  // routes/authRoutes.js
  // import express from "express";
  // import {
  //   registerUser,
  //   loginUser,
  //   googleLogin,
  // } from "../controllers/authController.js";

  // const router = express.Router();

  // // Local signup + login
  // router.post("/register", registerUser);
  // router.post("/login", loginUser);

  // // Google OAuth routes
  // router.get("/google", (req, res) => {
  //   const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile%20email&access_type=offline`;
    
  //   console.log('Redirecting to:', redirectUrl);
  //   res.redirect(redirectUrl);
  // });

  // router.get("/google/callback", async (req, res) => {
  //   try {
  //     const { code } = req.query;
      
  //     if (!code) {
  //       return res.status(400).send('Authorization code not provided');
  //     }

  //     console.log('Google authorization code received:', code);
      
  //     // Redirect to frontend with success message
  //     res.redirect(`${process.env.CLIENT_URL}?googleAuth=success&code=${code}`);
      
  //   } catch (error) {
  //     console.error('Google OAuth callback error:', error);
  //     res.redirect(`${process.env.CLIENT_URL}?googleAuth=error`);
  //   }
  // });

  // router.post("/google", googleLogin);

  // export default router;


  // today changes 05122025


import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

// ---------------- LOCAL AUTH ----------------
router.post("/register", registerUser);
router.post("/login", loginUser);

// ---------------- GOOGLE AUTH START ----------------

// 🔥 AUTO-DETECT FRONTEND URL (LOCAL OR LIVE)
function getClientURL(req) {
  const origin = req.headers.origin;

  // If request is from localhost → return local FRONTEND
  if (origin && origin.includes("localhost")) {
    return "http://localhost:5173";
  }

  // Otherwise → return LIVE URL
  return process.env.CLIENT_URL || "https://bharatvids.com";
}

// 🔥 Redirect user to Google Login Page
router.get("/google", (req, res) => {
  const CLIENT_REDIRECT = getClientURL(req);

  console.log("🔥 GOOGLE LOGIN STARTED → redirecting to Google...");
  console.log("Using Redirect URI:", process.env.GOOGLE_REDIRECT_URI);

  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.GOOGLE_CLIENT_ID
  }&redirect_uri=${
    process.env.GOOGLE_REDIRECT_URI
  }&response_type=code&scope=profile%20email&access_type=offline`;

  res.redirect(redirectUrl);
});

// 🔥 Google redirects back with code
router.get("/google/callback", async (req, res) => {
  const CLIENT_REDIRECT = getClientURL(req);

  try {
    const { code } = req.query;

    if (!code) {
      console.log("❌ NO AUTH CODE FROM GOOGLE");
      return res.redirect(`${CLIENT_REDIRECT}?googleAuth=error`);
    }

    console.log("🔥 GOOGLE AUTH CODE RECEIVED:", code);

    // Exchange code → Google ID Token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("🔥 TOKEN EXCHANGE RESULT:", tokenData);

    if (!tokenData.id_token) {
      console.log("❌ NO ID TOKEN RECEIVED FROM GOOGLE");
      return res.redirect(`${CLIENT_REDIRECT}?googleAuth=error`);
    }

    // Send ID token to backend to process user and generate JWT
    const appLoginRes = await fetch(`${process.env.API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: tokenData.id_token }),
    });

    const appLoginData = await appLoginRes.json();
    console.log("🔥 APP LOGIN DATA:", appLoginData);

    if (!appLoginData.token) {
      console.log("❌ BACKEND DID NOT RETURN TOKEN");
      return res.redirect(`${CLIENT_REDIRECT}?googleAuth=error`);
    }

    // Redirect user to frontend with JWT token and user object
    const redirectURL = `${CLIENT_REDIRECT}/?token=${appLoginData.token}&user=${encodeURIComponent(
      JSON.stringify(appLoginData.user)
    )}`;

    console.log("🔥 FINAL REDIRECT TO:", redirectURL);

    res.redirect(redirectURL);

  } catch (error) {
    console.error("❌ GOOGLE OAUTH ERROR:", error);
    res.redirect(`${CLIENT_REDIRECT}?googleAuth=error`);
  }
});

// Step 3: Backend handles Google ID token
router.post("/google", googleLogin);

// ---------------- GOOGLE AUTH END ----------------

export default router;
