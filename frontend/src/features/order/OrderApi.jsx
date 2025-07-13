// OrderApi.js - Frontend API functions

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://webloomecommerce.vercel.app'

// Helper function for consistent error handling
const handleApiResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Request failed'

        try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
        } catch (e) {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage
        }

        throw new Error(errorMessage)
    }

    return response.json()
}

// Helper function for making API calls
const makeApiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            credentials: 'include',
            ...options
        })

        return await handleApiResponse(response)
    } catch (error) {
        console.error(`API call failed: ${url}`, error)
        throw error
    }
}

export const createOrder = async (order) => {
    return makeApiCall(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
    })
}

export const getAllOrders = async (page = 1, limit = 10) => {
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
    })

    return makeApiCall(`${API_BASE_URL}/orders?${queryParams}`)
}

export const getOrderByUserId = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required')
    }

    return makeApiCall(`${API_BASE_URL}/orders/user/${userId}`)
}

export const updateOrderById = async (update) => {
    if (!update.id) {
        throw new Error('Order ID is required for update')
    }

    return makeApiCall(`${API_BASE_URL}/orders/${update.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(update.data)
    })
}

export const createRazorpayOrder = async (orderData) => {
    // Validate required fields
    if (!orderData.amount || orderData.amount <= 0) {
        throw new Error('Valid amount is required')
    }

    return makeApiCall(`${API_BASE_URL}/orders/razorpay/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    })
}

export const verifyRazorpayPayment = async (paymentData) => {
    // Validate required fields
    const requiredFields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']
    const missingFields = requiredFields.filter(field => !paymentData[field])

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    return makeApiCall(`${API_BASE_URL}/orders/razorpay/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
    })
}

// Complete payment flow helper
export const processRazorpayPayment = async (orderData, customerInfo = {}) => {
    try {
        // Step 1: Create Razorpay order
        const order = await createRazorpayOrder(orderData)

        // Step 2: Return a promise that resolves when payment is complete
        return new Promise((resolve, reject) => {
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_KAUQyodS5cqwyK',
                amount: order.amount,
                currency: order.currency,
                name: process.env.REACT_APP_STORE_NAME || 'Your Store',
                description: 'Purchase from your store',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // Step 3: Verify payment
                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }

                        const verification = await verifyRazorpayPayment(verificationData)

                        if (verification.verified) {
                            resolve({
                                success: true,
                                order: order,
                                payment: response,
                                verification: verification
                            })
                        } else {
                            reject(new Error('Payment verification failed'))
                        }
                    } catch (error) {
                        reject(error)
                    }
                },
                prefill: {
                    name: customerInfo.name || '',
                    email: customerInfo.email || '',
                    contact: customerInfo.phone || ''
                },
                theme: {
                    color: process.env.REACT_APP_THEME_COLOR || '#3399cc'
                },
                modal: {
                    ondismiss: function () {
                        reject(new Error('Payment cancelled by user'))
                    }
                }
            }

            // Check if Razorpay is loaded
            if (typeof window.Razorpay === 'undefined') {
                reject(new Error('Razorpay SDK not loaded. Please include the Razorpay script.'))
                return
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        })
    } catch (error) {
        console.error('Payment process error:', error)
        throw error
    }
}

// Helper function to format amount to paise
export const formatToPaise = (amount) => {
    return Math.round(amount * 100)
}

// Helper function to format amount from paise
export const formatFromPaise = (paise) => {
    return paise / 100
}