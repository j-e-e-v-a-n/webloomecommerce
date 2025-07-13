// routes/Order.js - Backend routes
const express = require('express')
const orderController = require("../controllers/Order")
const router = express.Router()

router
    .post("/", orderController.create)
    .get("/", orderController.getAll)
    .get("/user/:id", orderController.getByUserId)
    .patch("/:id", orderController.updateById)
    .post("/razorpay/create", orderController.createRazorpayOrder)
    .post("/razorpay/verify", orderController.verifyRazorpayPayment)

module.exports = router