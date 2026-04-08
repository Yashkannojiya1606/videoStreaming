
   


// new code 02/04 by  yash 

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


//   const CLIENT_URL = getClientURL(req);

//   try {
//     const { code } = req.query;

//     if (!code) {
//       return res.redirect(`${CLIENT_URL}?googleAuth=error`);
//     }

//     // Exchange code → id_token
//     const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         code,
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         redirect_uri: process.env.GOOGLE_REDIRECT_URI,
//         grant_type: "authorization_code",
//       }),
//     });

//     const tokenData = await tokenRes.json();

//     if (!tokenData.id_token) {
//       console.log("❌ No ID Token:", tokenData);
//       return res.redirect(`${CLIENT_URL}?googleAuth=error`);
//     }

//     // ✅ DIRECT CALL (NO fetch)
//     const result = await googleLogin(tokenData.id_token);

//     if (!result || !result.token) {
//       console.log("❌ googleLogin failed:", result);
//       return res.redirect(`${CLIENT_URL}?googleAuth=error`);
//     }

//     // ✅ SUCCESS REDIRECT
//     return res.redirect(
//       `${CLIENT_URL}/?token=${result.token}&user=${encodeURIComponent(
//         JSON.stringify(result.user)
//       )}`
//     );
//   } catch (err) {
//     console.error("GOOGLE AUTH ERROR:", err);
//     return res.redirect(`${CLIENT_URL}?googleAuth=error`);
//   }
// });
router.get("/google/callback", async (req, res) => {
  const CLIENT_URL = getClientURL(req);


  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${CLIENT_URL}?googleAuth=error`);
    }


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


    if (!tokenData.id_token) {
      return res.redirect(`${CLIENT_URL}?googleAuth=error`);
    }


    // Call controller
    const result = await googleLogin(tokenData.id_token);


    if (!result || !result.token) {
      console.log("❌ Token generation failed");
      return res.redirect(`${CLIENT_URL}?googleAuth=error`);
    }


    return res.redirect(
      `${CLIENT_URL}/?token=${result.token}&user=${encodeURIComponent(
        JSON.stringify(result.user)
      )}`
    );
  } catch (err) {
    console.error("💥 GOOGLE AUTH ERROR:", err);
    return res.redirect(`${CLIENT_URL}?googleAuth=error`);
  }
});
/* --------------------------------------------------------
   STEP 3 — Backend verifies Google ID token (API use)
--------------------------------------------------------- */
router.post("/google", async (req, res) => {
  try {
    const result = await googleLogin(req.body.id_token);

    if (!result) {
      return res.status(400).json({ message: "Google auth failed" });
    }

    res.json(result);
  } catch (err) {
    console.error("GOOGLE LOGIN API ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------------------------------------
   Local Login / Register (UNCHANGED ✅)
--------------------------------------------------------- */
router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;