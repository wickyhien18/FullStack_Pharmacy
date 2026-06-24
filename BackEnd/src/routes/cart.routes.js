// ================================================================
// cart.route.jsx — Tất cả route cần đăng nhập
// ================================================================
import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", cartController.addToCart);
router.patch("/items/:cartItemId", cartController.updateCartItem);
router.delete("/items/:cartItemId", cartController.removeFromCart);

export default router;
