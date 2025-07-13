// server.js - Updated server file
require("dotenv").config()
const express = require('express')
const cors = require('cors')
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/Auth")
const productRoutes = require("./routes/Product")
const orderRoutes = require("./routes/Order")
const cartRoutes = require("./routes/Cart")
const brandRoutes = require("./routes/Brand")
const categoryRoutes = require("./routes/Category")
const userRoutes = require("./routes/User")
const addressRoutes = require('./routes/Address')
const reviewRoutes = require("./routes/Review")
const wishlistRoutes = require("./routes/Wishlist")
const { connectToDB } = require("./database/db")

// server init
const server = express()

// database connection
connectToDB()

// middlewares
server.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    exposedHeaders: ['X-Total-Count'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}))
server.use(express.json())
server.use(cookieParser())
server.use(morgan("tiny"))

// routeMiddleware
server.use("/auth", authRoutes)
server.use("/users", userRoutes)
server.use("/products", productRoutes)
server.use("/orders", orderRoutes)
server.use("/cart", cartRoutes)
server.use("/brands", brandRoutes)
server.use("/categories", categoryRoutes)
server.use("/address", addressRoutes)
server.use("/reviews", reviewRoutes)
server.use("/wishlist", wishlistRoutes)

server.get("/", (req, res) => {
    res.status(200).json({ message: 'E-commerce API running with Razorpay integration' })
})

// Health check endpoint
server.get("/health", (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    })
})

// Error handling middleware
server.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
    console.log(`Server [STARTED] ~ http://localhost:${PORT}`)
    console.log(`Razorpay Integration: ${process.env.RAZORPAY_KEY_ID ? 'Enabled' : 'Disabled'}`)
})