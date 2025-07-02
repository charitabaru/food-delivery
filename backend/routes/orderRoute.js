import express from "express";
import {
    placeOrder,
    getUserOrders,
    updateOrderStatus,
    getOrderById,
    verifyOrder,listOrders
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

// Place new order
orderRouter.post("/place", authMiddleware, placeOrder);

// Verify payment
orderRouter.post("/verify", verifyOrder);

// Get user orders
orderRouter.get("/userorders", authMiddleware, getUserOrders);

// Get single order by ID
orderRouter.get("/single/:orderId", authMiddleware, getOrderById);

// Update order status (admin)
orderRouter.put("/update-status", updateOrderStatus);

orderRouter.get("/list", listOrders);

export default orderRouter;