import { Router } from "express";
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

export default router;
