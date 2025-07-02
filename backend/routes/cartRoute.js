import express from "express";
import { addToCart, removeFromCart, getCart, clearCart, updateCartItem, getCartCount } from "../controllers/cartController.js";
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

// All cart routes require authentication
cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.get("/get", authMiddleware, getCart);
cartRouter.delete("/clear", authMiddleware, clearCart);
cartRouter.put("/update", authMiddleware, updateCartItem);
cartRouter.get("/count", authMiddleware, getCartCount);

export default cartRouter;