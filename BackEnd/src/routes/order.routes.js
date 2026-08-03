import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication once for every order route.
router.use(authenticate);

// Orders
router.post("/", orderController.createOrder);
router.get("/my", orderController.getMyOrders);
router.get("/:orderId", orderController.getOrderDetail);
router.post("/:orderId/cancel", orderController.cancelOrder);

export default router;
