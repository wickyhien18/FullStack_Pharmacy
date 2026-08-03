import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Require authentication for every admin route.
router.use(authenticate);

const staffAccess = authorize("ROLE_ADMIN", "ROLE_STAFF");
const adminOnly = authorize("ROLE_ADMIN");

// Dashboard
router.get("/stats", staffAccess, adminController.getDashboardStats);

// Orders
router.get("/orders", staffAccess, adminController.getAllOrders);
router.patch(
  "/orders/:orderId/status",
  staffAccess,
  adminController.updateOrderStatus,
);
router.patch(
  "/orders/:orderId/cancel-request",
  staffAccess,
  adminController.handleCancelRequest,
);

// Users
router.get("/users", adminOnly, adminController.getAllUsers);
router.patch(
  "/users/:userId/status",
  adminOnly,
  adminController.updateUserStatus,
);
router.patch("/users/:userId/role", adminOnly, adminController.updateUserRole);
router.get("/roles", adminOnly, adminController.getRoles);

// Products
router.get("/products", staffAccess, adminController.getAllProducts);
router.get(
  "/products/:productId",
  staffAccess,
  adminController.getProductDetail,
);
router.post("/products", adminOnly, adminController.createProduct);
router.put("/products/:productId", staffAccess, adminController.updateProduct);
router.delete("/products/:productId", adminOnly, adminController.deleteProduct);

export default router;
