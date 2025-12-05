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

/* --------------------------------------------------------
   Detect Client URL
--------------------------------------------------------- */
function getClientURL(req) {
  const origin = req.headers.origin || "";

  if (origin.includes("localhost")) {
    return "http://localhost:5173";
  }

  return process.env.CLIENT_URL || "https://bharatvids.com";
}

/* --------------------------------------------------------
   STEP 1 — Redirect user to Google login page
--------------------------------------------------------- */
router.get("/google", (req, res) => {
  const redirectURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.GOOGLE_CLIENT_ID
  }&redirect_uri=${
    process.env.GOOGLE_REDIRECT_URI
  }&response_type=code&scope=profile%20email`;

  res.redirect(redirectURL);
});

/* --------------------------------------------------------
   STEP 2 — Google redirects BACK with "code"
--------------------------------------------------------- */
router.get("/google/callback", async (req, res) => {
  const CLIENT_URL = getClientURL(req);

  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${CLIENT_URL}?googleAuth=error`);

    // Exchange code → id_token
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
    if (!tokenData.id_token)
      return res.redirect(`${CLIENT_URL}?googleAuth=error`);

    // Send ID token to backend auth processor
    const appRes = await fetch(
      `${process.env.API_URL}/auth/google`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: tokenData.id_token }),
      }
    );

    const appData = await appRes.json();
    if (!appData.token)
      return res.redirect(`${CLIENT_URL}?googleAuth=error`);

    return res.redirect(
      `${CLIENT_URL}/?token=${appData.token}&user=${encodeURIComponent(
        JSON.stringify(appData.user)
      )}`
    );
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    return res.redirect(`${CLIENT_URL}?googleAuth=error`);
  }
});

/* --------------------------------------------------------
   STEP 3 — Backend verifies Google ID token
--------------------------------------------------------- */
router.post("/google", googleLogin);

/* --------------------------------------------------------
   Local Login / Register
--------------------------------------------------------- */
router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
