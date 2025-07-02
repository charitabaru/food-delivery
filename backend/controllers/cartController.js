import userModel from "../models/userModel.js";

// Add items to user cart
const addToCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id; // From auth middleware

        // Validate itemId
        if (!itemId) {
            return res.json({
                success: false,
                message: "Item ID is required"
            });
        }

        // Find user and get current cart data
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        let cartData = userData.cartData || {};

        // Add item to cart (increment quantity)
        if (!cartData[itemId]) {
            cartData[itemId] = 1;
        } else {
            cartData[itemId] += 1;
        }

        // Update user's cart in database
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({
            success: true,
            message: "Item added to cart",
            cartData
        });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id; // From auth middleware

        // Validate itemId
        if (!itemId) {
            return res.json({
                success: false,
                message: "Item ID is required"
            });
        }

        // Find user and get current cart data
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        let cartData = userData.cartData || {};

        // Remove item from cart (decrement quantity)
        if (cartData[itemId] && cartData[itemId] > 0) {
            cartData[itemId] -= 1;
            
            // Remove item completely if quantity becomes 0
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }

        // Update user's cart in database
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({
            success: true,
            message: "Item removed from cart",
            cartData
        });

    } catch (error) {
        console.error("Error removing from cart:", error);
        res.json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get user cart data
const getCart = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        // Find user and get cart data
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const cartData = userData.cartData || {};

        res.json({
            success: true,
            message: "Cart data retrieved successfully",
            cartData
        });

    } catch (error) {
        console.error("Error getting cart:", error);
        res.json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        // Find user
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Clear cart data
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({
            success: true,
            message: "Cart cleared successfully",
            cartData: {}
        });

    } catch (error) {
        console.error("Error clearing cart:", error);
        res.json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update cart item quantity directly
const updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const userId = req.user.id; // From auth middleware

        // Validate input
        if (!itemId || quantity === undefined) {
            return res.json({
                success: false,
                message: "Item ID and quantity are required"
            });
        }

        if (quantity < 0) {
            return res.json({
                success: false,
                message: "Quantity cannot be negative"
            });
        }

        // Find user
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        let cartData = userData.cartData || {};

        // Update quantity
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }

        // Update user's cart in database
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({
            success: true,
            message: "Cart updated successfully",
            cartData
        });

    } catch (error) {
        console.error("Error updating cart:", error);
        res.json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get cart item count (total number of items)
const getCartCount = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        // Find user and get cart data
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const cartData = userData.cartData || {};
        let totalCount = 0;

        // Calculate total count
        for (const itemId in cartData) {
            if (cartData[itemId] > 0) {
                totalCount += cartData[itemId];
            }
        }

        res.json({
            success: true,
            message: "Cart count retrieved successfully",
            count: totalCount,
            cartData
        });

    } catch (error) {
        console.error("Error getting cart count:", error);
        res.json({
            success: false,
            message: "Internal server error"
        });
    }
};

export {
    addToCart,
    removeFromCart,
    getCart,
    clearCart,
    updateCartItem,
    getCartCount
};