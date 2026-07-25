import { Router } from "express";
import passport from "passport";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  authRateLimit,
  refreshRateLimit,
} from "../middlewares/security.middleware.js";
import { registerSchema, loginSchema } from "../validator/auth.validator.js";

const router = Router();

router.post(
  "/register",
  authRateLimit,
  validate(registerSchema),
  authController.register,
);
router.post(
  "/login",
  authRateLimit,
  validate(loginSchema),
  authController.login,
);
router.post("/refresh-token", refreshRateLimit, authController.refreshToken);
router.post("/logout", authController.logout);

router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/profile", authenticate, authController.getProfile);

router.put("/profile", authenticate, authController.updateProfile);
router.put("/change-password", authenticate, authController.changePassword);
router.post(
  "/request-email-change",
  authenticate,
  authController.requestEmailChange,
);
router.post(
  "/verify-email-change",
  authenticate,
  authController.verifyEmailChange,
);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/account?error=google_auth_failed`,
  }),
  authController.googleCallback,
);

export default router;
