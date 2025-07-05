import express from "express";
import {
    placeOrder,
    placeOrderCOD,
    placeOrderStripe,
    getUserOrders,
    updateOrderStatus,
    getOrderById,
    verifyOrder,
    listOrders
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

// Place new order (supports both COD and Stripe based on paymentMethod in request body)
orderRouter.post("/place", authMiddleware, placeOrder);

// Place order with COD (specific endpoint)
orderRouter.post("/place-cod", authMiddleware, placeOrderCOD);

// Place order with Stripe (specific endpoint)
orderRouter.post("/place-stripe", authMiddleware, placeOrderStripe);

// Verify payment
orderRouter.post("/verify", verifyOrder);

// Get user orders
orderRouter.get("/userorders", authMiddleware, getUserOrders);

// Get single order by ID
orderRouter.get("/single/:orderId", authMiddleware, getOrderById);

// Update order status (admin)
orderRouter.put("/update-status", updateOrderStatus);

// List all orders (admin)
orderRouter.get("/list", listOrders);

export default orderRouter;