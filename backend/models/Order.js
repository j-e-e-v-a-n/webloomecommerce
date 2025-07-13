// models/Order.js - Updated Order model
const mongoose = require("mongoose")
const { Schema } = mongoose

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    item: {
        type: [Schema.Types.Mixed],
        required: true
    },
    address: {
        type: Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentMode: {
        type: String,
        enum: ['COD', 'UPI', 'CARD'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: function() {
            return this.paymentMode === 'COD' ? 'Pending' : 'Pending'
        }
    },
    total: {
        type: Number,
        required: true
    },
    // Razorpay specific fields
    razorpay_order_id: {
        type: String,
        required: function() {
            return this.paymentMode === 'CARD'
        }
    },
    razorpay_payment_id: {
        type: String,
        required: function() {
            return this.paymentMode === 'CARD' && this.paymentStatus === 'Paid'
        }
    },
    razorpay_signature: {
        type: String,
        required: function() {
            return this.paymentMode === 'CARD' && this.paymentStatus === 'Paid'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    versionKey: false,
    timestamps: true 
})

// Pre-save middleware to update payment status based on Razorpay fields
orderSchema.pre('save', function(next) {
    if (this.paymentMode === 'CARD' && this.razorpay_payment_id) {
        this.paymentStatus = 'Paid'
        this.status = 'Confirmed'
    }
    next()
})

module.exports = mongoose.model("Order", orderSchema)