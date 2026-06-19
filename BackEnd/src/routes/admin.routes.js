// ================================================================
// admin.routes.js — Tất cả route cần ROLE_ADMIN
// ================================================================
import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Áp dụng authenticate + authorize cho toàn bộ admin routes
router.use(authenticate);
router.use(authorize("ROLE_ADMIN"));

// Dashboard
router.get("/stats", adminController.getDashboardStats);

// Orders
router.get("/orders", adminController.getAllOrders);
router.patch("/orders/:orderId/status", adminController.updateOrderStatus);

// Users
router.get("/users", adminController.getAllUsers);
router.patch("/users/:userId/status", adminController.updateUserStatus);
router.patch("/users/:userId/role", adminController.updateUserRole);
router.get("/roles", adminController.getRoles);

// Medicines
router.get("/medicines", adminController.getAllMedicines);
router.post("/medicines", adminController.createMedicine);
router.put("/medicines/:medicineId", adminController.updateMedicine);
router.delete("/medicines/:medicineId", adminController.deleteMedicine);

export default router;
