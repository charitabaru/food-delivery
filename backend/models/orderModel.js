import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'stripe'],
        default: 'stripe'
    },
    status: {
        type: String,
        enum: [
            'Order Placed',
            'Payment Pending',
            'Order Confirmed',
            'Preparing',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        ],
        default: 'Order Placed'
    },
    payment: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;