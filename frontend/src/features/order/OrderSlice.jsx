import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createOrder, getAllOrders, getOrderByUserId, updateOrderById, createRazorpayOrder, verifyRazorpayPayment } from './OrderApi'

const initialState = {
    status: "idle",
    orderUpdateStatus: "idle",
    orderFetchStatus: "idle",
    razorpayOrderStatus: "idle",
    paymentVerificationStatus: "idle",
    orders: [],
    currentOrder: null,
    razorpayOrder: null,
    errors: null,
    successMessage: null
}

export const createOrderAsync = createAsyncThunk("orders/createOrderAsync", async (order) => {
    const createdOrder = await createOrder(order)
    return createdOrder
})

export const getAllOrdersAsync = createAsyncThunk("orders/getAllOrdersAsync", async () => {
    const orders = await getAllOrders()
    return orders
})

export const getOrderByUserIdAsync = createAsyncThunk("orders/getOrderByUserIdAsync", async (id) => {
    const orders = await getOrderByUserId(id)
    return orders
})

export const updateOrderByIdAsync = createAsyncThunk("orders/updateOrderByIdAsync", async (update) => {
    const updatedOrder = await updateOrderById(update)
    return updatedOrder
})

export const createRazorpayOrderAsync = createAsyncThunk("orders/createRazorpayOrderAsync", async (orderData) => {
    const razorpayOrder = await createRazorpayOrder(orderData)
    return razorpayOrder
})

export const verifyRazorpayPaymentAsync = createAsyncThunk("orders/verifyRazorpayPaymentAsync", async (paymentData) => {
    const verificationResult = await verifyRazorpayPayment(paymentData)
    return verificationResult
})

const orderSlice = createSlice({
    name: 'orderSlice',
    initialState: initialState,
    reducers: {
        resetCurrentOrder: (state) => {
            state.currentOrder = null
        },
        resetOrderUpdateStatus: (state) => {
            state.orderUpdateStatus = 'idle'
        },
        resetOrderFetchStatus: (state) => {
            state.orderFetchStatus = 'idle'
        },
        resetRazorpayOrderStatus: (state) => {
            state.razorpayOrderStatus = 'idle'
            state.razorpayOrder = null
        },
        resetPaymentVerificationStatus: (state) => {
            state.paymentVerificationStatus = 'idle'
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrderAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(createOrderAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                state.orders.push(action.payload)
                state.currentOrder = action.payload
            })
            .addCase(createOrderAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })

            .addCase(getAllOrdersAsync.pending, (state) => {
                state.orderFetchStatus = 'pending'
            })
            .addCase(getAllOrdersAsync.fulfilled, (state, action) => {
                state.orderFetchStatus = 'fulfilled'
                state.orders = action.payload
            })
            .addCase(getAllOrdersAsync.rejected, (state, action) => {
                state.orderFetchStatus = 'rejected'
                state.errors = action.error
            })

            .addCase(getOrderByUserIdAsync.pending, (state) => {
                state.orderFetchStatus = 'pending'
            })
            .addCase(getOrderByUserIdAsync.fulfilled, (state, action) => {
                state.orderFetchStatus = 'fulfilled'
                state.orders = action.payload
            })
            .addCase(getOrderByUserIdAsync.rejected, (state, action) => {
                state.orderFetchStatus = 'rejected'
                state.errors = action.error
            })

            .addCase(updateOrderByIdAsync.pending, (state) => {
                state.orderUpdateStatus = 'pending'
            })
            .addCase(updateOrderByIdAsync.fulfilled, (state, action) => {
                state.orderUpdateStatus = 'fulfilled'
                const index = state.orders.findIndex((order) => order._id === action.payload._id)
                state.orders[index] = action.payload
            })
            .addCase(updateOrderByIdAsync.rejected, (state, action) => {
                state.orderUpdateStatus = 'rejected'
                state.errors = action.error
            })

            .addCase(createRazorpayOrderAsync.pending, (state) => {
                state.razorpayOrderStatus = 'pending'
            })
            .addCase(createRazorpayOrderAsync.fulfilled, (state, action) => {
                state.razorpayOrderStatus = 'fulfilled'
                state.razorpayOrder = action.payload
            })
            .addCase(createRazorpayOrderAsync.rejected, (state, action) => {
                state.razorpayOrderStatus = 'rejected'
                state.errors = action.error
            })

            .addCase(verifyRazorpayPaymentAsync.pending, (state) => {
                state.paymentVerificationStatus = 'pending'
            })
            .addCase(verifyRazorpayPaymentAsync.fulfilled, (state, action) => {
                state.paymentVerificationStatus = 'fulfilled'
            })
            .addCase(verifyRazorpayPaymentAsync.rejected, (state, action) => {
                state.paymentVerificationStatus = 'rejected'
                state.errors = action.error
            })
    }
})

// exporting reducers
export const { resetCurrentOrder, resetOrderUpdateStatus, resetOrderFetchStatus, resetRazorpayOrderStatus, resetPaymentVerificationStatus } = orderSlice.actions

// exporting selectors
export const selectOrderStatus = (state) => state.OrderSlice.status
export const selectOrders = (state) => state.OrderSlice.orders
export const selectOrdersErrors = (state) => state.OrderSlice.errors
export const selectOrdersSuccessMessage = (state) => state.OrderSlice.successMessage
export const selectCurrentOrder = (state) => state.OrderSlice.currentOrder
export const selectOrderUpdateStatus = (state) => state.OrderSlice.orderUpdateStatus
export const selectOrderFetchStatus = (state) => state.OrderSlice.orderFetchStatus
export const selectRazorpayOrderStatus = (state) => state.OrderSlice.razorpayOrderStatus
export const selectRazorpayOrder = (state) => state.OrderSlice.razorpayOrder
export const selectPaymentVerificationStatus = (state) => state.OrderSlice.paymentVerificationStatus

export default orderSlice.reducer