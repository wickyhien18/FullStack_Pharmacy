
// ================================================================
// order.routes.js — Tất cả route đều cần đăng nhập
// ================================================================
import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Tất cả route cần authenticate — dùng router.use thay vì thêm vào từng route
router.use(authenticate);

router.post('/',          orderController.createOrder);   // Tạo đơn hàng
router.get('/my',         orderController.getMyOrders);   // Lịch sử đơn của tôi
router.get('/:orderId',   orderController.getOrderDetail);// Chi tiết 1 đơn

export default router;
