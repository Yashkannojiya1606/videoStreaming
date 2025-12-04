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


  // today changes 04122025


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

// Step 1: Redirect user to Google Login Page
router.get("/google", (req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.GOOGLE_CLIENT_ID
  }&redirect_uri=${
    process.env.GOOGLE_REDIRECT_URI
  }&response_type=code&scope=profile%20email&access_type=offline`;

  res.redirect(redirectUrl);
});

// Step 2: Google Redirects back with ?code=
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${process.env.CLIENT_URL}?googleAuth=error`);

    // Step 3: Exchange code -> Google tokens
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
      return res.redirect(`${process.env.CLIENT_URL}?googleAuth=error`);

    // Step 4: Send Google ID Token to backend to process user
    const appLoginRes = await fetch(`${process.env.API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: tokenData.id_token }),
    });

    const appLoginData = await appLoginRes.json();

    if (!appLoginData.token)
      return res.redirect(`${process.env.CLIENT_URL}?googleAuth=error`);

    // Step 5: Send your JWT + user to frontend
    res.redirect(
      `${process.env.CLIENT_URL}/?token=${appLoginData.token}&user=${encodeURIComponent(
        JSON.stringify(appLoginData.user)
      )}`
    );
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.redirect(`${process.env.CLIENT_URL}?googleAuth=error`);
  }
});

// Step 3 Controller
router.post("/google", googleLogin);

// ---------------- GOOGLE AUTH END ----------------

export default router;
