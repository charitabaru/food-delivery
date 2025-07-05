import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Place order with COD
const placeOrderCOD = async (req, res) => {
    try {
        // Get userId from the authenticated user (set by auth middleware)
        const userId = req.user.id;
        
        const newOrder = new orderModel({
            userId: userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            paymentMethod: "cod",
            payment: false, // Will be true when payment is received on delivery
            status: "Order Placed"
        })
        await newOrder.save();

        // Clear user's cart after placing order
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ 
            success: true, 
            message: "Order placed successfully with COD",
            orderId: newOrder._id
        });

    } catch (error) {
        console.error("Error placing COD order:", error);
        res.json({ success: false, message: "Error placing order" });
    }
};

// Place order with Stripe
const placeOrderStripe = async (req, res) => {
    try {
        // Get userId from the authenticated user (set by auth middleware)
        const userId = req.user.id;
        
        const newOrder = new orderModel({
            userId: userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            paymentMethod: "stripe",
            payment: false, // Will be true after successful payment
            status: "Payment Pending"
        })
        await newOrder.save();

        // Create line items for Stripe
        // Since prices are already in INR, just multiply by 100 to convert to paise
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100) // Convert INR to paise
            },
            quantity: item.quantity
        }))
        
        // Add delivery charge (25 INR = 2500 paise)
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charge",
                },
                unit_amount: 25 * 100 // 25 INR = 2500 paise
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${process.env.CLIENT_URL}/verify?success=false&orderId=${newOrder._id}`,
            metadata: {
                orderId: newOrder._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url })

    } catch (error) {
        console.error("Error placing Stripe order:", error);
        res.json({ success: false, message: "Error creating payment session" });
    }
};

// Legacy placeOrder function (for backward compatibility)
const placeOrder = async (req, res) => {
    try {
        const paymentMethod = req.body.paymentMethod || "stripe"; // Default to stripe for backward compatibility
        
        if (paymentMethod === "cod") {
            return placeOrderCOD(req, res);
        } else if (paymentMethod === "stripe") {
            return placeOrderStripe(req, res);
        } else {
            return res.json({ success: false, message: "Invalid payment method" });
        }
    } catch (error) {
        console.error("Error in placeOrder:", error);
        res.json({ success: false, message: "Internal server error" });
    }
};

// Verify payment and update order status
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { 
                payment: true,
                status: "Order Confirmed"
            });
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            // Delete the order if payment failed
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment failed" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error verifying payment" });
    }
};

// Get all orders for logged-in user
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await orderModel.find({ userId: userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};

const listOrders = async (req, res) => {
    try{
        const orders = await orderModel.find({}).sort({ createdAt: -1 });
        res.json({success: true, data: orders})
    }catch(error){
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" });
    }
}

// Get a single order by ID
const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = req.user.id;
        
        const order = await orderModel.findOne({ 
            _id: orderId, 
            userId: userId
        });
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching order" });
    }
};

// Update order status (admin or system use)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
            return res.json({ success: false, message: "Order ID and status are required" });
        }

        await orderModel.findByIdAndUpdate(orderId, { status: status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" });
    }
};

export {
    placeOrder,
    placeOrderCOD,
    placeOrderStripe,
    getUserOrders,
    getOrderById,
    verifyOrder,
    updateOrderStatus,
    listOrders
};