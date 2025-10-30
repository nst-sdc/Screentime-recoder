import express from "express";
import passport from "../config/passport.js";
import { verifyToken, isAuthenticated } from "../middleware/auth.js";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleSuccess,
  googleFailure,
  getProfile,
  updateProfile,
  deleteAccount,
  logout,
  verifyToken as verifyTokenController
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure"
  }),
  googleSuccess
);

router.get("/google/failure", googleFailure);

router.get("/verify", verifyToken, verifyTokenController);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.delete("/account", verifyToken, deleteAccount);

router.post("/logout", logout);

export default router;
