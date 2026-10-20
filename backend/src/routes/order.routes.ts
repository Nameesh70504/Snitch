import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createOrder, getOrders, cancelOrder, updateOrderStatus } from "../controllers/order.controller.js";
import { createOrderValidator } from "../validators/order.validate.js";

const router = express.Router();

router.post("/", authenticate, createOrderValidator, createOrder);

router.get("/", authenticate, getOrders);

router.patch("/:id/cancel", authenticate, cancelOrder);

router.patch("/:id/status", authenticate, updateOrderStatus);

export default router;
