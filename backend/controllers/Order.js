// controllers/Order.js - Backend controller
const Order = require("../models/Order")
const Razorpay = require('razorpay')
const crypto = require('crypto')


exports.create = async (req, res) => {
    try {
        const created = new Order(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error creating an order, please try again later' })
    }
}

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params
        const results = await Order.find({ user: id }).populate('user', 'name email')
        res.status(200).json(results)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error fetching orders, please try again later' })
    }
}

exports.getAll = async (req, res) => {
    try {
        let skip = 0
        let limit = 0
        if (req.query.page && req.query.limit) {
            const pageSize = req.query.limit
            const page = req.query.page
            skip = pageSize * (page - 1)
            limit = pageSize
        }
        const totalDocs = await Order.find({}).countDocuments().exec()
        const results = await Order.find({}).skip(skip).limit(limit).populate('user', 'name email').exec()
        res.header("X-Total-Count", totalDocs)
        res.status(200).json(results)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching orders, please try again later' })
    }
}

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params
        const updated = await Order.findByIdAndUpdate(id, req.body, { new: true })
        res.status(200).json(updated)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating order, please try again later' })
    }
}

exports.createRazorpayOrder = async (req, res) => {
    try {
        console.log('=== RAZORPAY DEBUG INFO ===');
        console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
        console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET);
        console.log('Key ID exists:', !!process.env.RAZORPAY_KEY_ID);
        console.log('Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);
        console.log('All RAZORPAY env vars:', Object.keys(process.env).filter(key => key.includes('RAZORPAY')));
        console.log('=== END DEBUG INFO ===');

        // Initialize Razorpay ONLY here - never globally
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const { amount, currency, receipt, notes } = req.body

        // Validate and ensure amount is an integer
        let amountInPaise;
        if (typeof amount === 'string') {
            amountInPaise = parseInt(amount, 10);
        } else if (typeof amount === 'number') {
            amountInPaise = Math.round(amount);
        } else {
            return res.status(400).json({
                message: 'Invalid amount format. Amount must be a number or string representing paise.'
            });
        }

        // Validate that amount is positive
        if (amountInPaise <= 0 || isNaN(amountInPaise)) {
            return res.status(400).json({
                message: 'Amount must be a positive integer in paise (smallest currency unit).'
            });
        }

        const options = {
            amount: amountInPaise, // amount in smallest currency unit (paise for INR) - MUST BE INTEGER
            currency: currency || 'INR',
            receipt: receipt || `order_${Date.now()}`,
            notes: notes || {}
        }

        console.log('Creating order with options:', options);
        console.log('Amount type:', typeof options.amount);
        console.log('Amount value:', options.amount);

        const order = await razorpay.orders.create(options)
        
        console.log('Order created successfully:', order.id);
        
        res.status(201).json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            receipt: order.receipt,
            status: order.status,
            created_at: order.created_at
        })
    } catch (error) {
        console.log('Razorpay Order Creation Error:', error)
        res.status(500).json({ 
            message: 'Error creating Razorpay order', 
            error: error.message 
        })
    }
}

exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature 
        } = req.body

        // Create the signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex")

        const isAuthentic = expectedSignature === razorpay_signature

        if (isAuthentic) {
            // Payment is verified, you can save the payment details to your database
            res.status(200).json({
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                signature: razorpay_signature,
                verified: true
            })
        } else {
            res.status(400).json({
                message: 'Payment verification failed',
                verified: false
            })
        }
    } catch (error) {
        console.log('Payment Verification Error:', error)
        res.status(500).json({ 
            message: 'Error verifying payment', 
            error: error.message 
        })
    }
}