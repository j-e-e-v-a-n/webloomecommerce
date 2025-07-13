import { Stack, TextField, Typography, Button, Menu, MenuItem, Select, Grid, FormControl, Radio, Paper, IconButton, Box, useTheme, useMediaQuery, Alert, Divider } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import React, { useEffect, useState } from 'react'
import { Cart } from '../../cart/components/Cart'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { addAddressAsync, selectAddressStatus, selectAddresses } from '../../address/AddressSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { Link, useNavigate } from 'react-router-dom'
import { createOrderAsync, selectCurrentOrder, selectOrderStatus, createRazorpayOrderAsync, selectRazorpayOrderStatus } from '../../order/OrderSlice'
import { resetCartByUserIdAsync, selectCartItems } from '../../cart/CartSlice'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { SHIPPING, TAXES } from '../../../constants'
import { motion } from 'framer-motion'

export const Checkout = () => {
    const status = ''
    const addresses = useSelector(selectAddresses)
    const [selectedAddress, setSelectedAddress] = useState(addresses[0])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD')
    const [paymentError, setPaymentError] = useState('')
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
    const dispatch = useDispatch()
    const loggedInUser = useSelector(selectLoggedInUser)
    const addressStatus = useSelector(selectAddressStatus)
    const navigate = useNavigate()
    const cartItems = useSelector(selectCartItems)
    const orderStatus = useSelector(selectOrderStatus)
    const razorpayOrderStatus = useSelector(selectRazorpayOrderStatus)
    const currentOrder = useSelector(selectCurrentOrder)

    // Enhanced pricing calculations with detailed breakdown
    const orderTotal = cartItems.reduce((acc, item) => (item.product.price * item.quantity) + acc, 0)
    const shippingAmount = SHIPPING || 0
    const taxAmount = TAXES || 0
    const finalTotal = orderTotal + shippingAmount + taxAmount

    // Helper function to convert amount to paise (smallest currency unit) with rounding
    const convertToPaise = (amount) => {
        const rounded = Math.round(parseFloat(amount) * 100)
        console.log(`Converting ₹${amount} to paise: ${amount} * 100 = ${amount * 100} → rounded to ${rounded}`)
        return rounded
    }

    // Helper function to format currency display
    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`
    }

    // Helper function to format integer display
    const formatInteger = (amount) => {
        return Math.round(parseFloat(amount))
    }

    const theme = useTheme()
    const is900 = useMediaQuery(theme.breakpoints.down(900))
    const is480 = useMediaQuery(theme.breakpoints.down(480))

    useEffect(() => {
        if (addressStatus === 'fulfilled') {
            reset()
        }
        else if (addressStatus === 'rejected') {
            alert('Error adding your address')
        }
    }, [addressStatus])

    useEffect(() => {
        if (currentOrder && currentOrder?._id) {
            dispatch(resetCartByUserIdAsync(loggedInUser?._id))
            navigate(`/order-success/${currentOrder?._id}`)
        }
    }, [currentOrder])

    const handleAddAddress = (data) => {
        const address = { ...data, user: loggedInUser._id }
        dispatch(addAddressAsync(address))
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            // Check if Razorpay is already loaded
            if (window.Razorpay) {
                resolve(true)
                return
            }

            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => {
                console.log('Razorpay script loaded successfully')
                resolve(true)
            }
            script.onerror = () => {
                console.error('Failed to load Razorpay script')
                resolve(false)
            }
            document.body.appendChild(script)
        })
    }

    const handleRazorpayPayment = async (razorpayOrder) => {
        const res = await loadRazorpayScript()

        if (!res) {
            setPaymentError('Razorpay SDK failed to load. Please check your internet connection.')
            return
        }

        // Check if Razorpay is available
        if (!window.Razorpay) {
            setPaymentError('Razorpay is not available. Please refresh the page and try again.')
            return
        }

        const options = {
            // FIXED: Use your actual key ID instead of environment variable
            key: 'rzp_test_IvGWMBpENteAE2', // Your actual Razorpay key ID
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: 'Your Store Name',
            description: 'Order Payment',
            order_id: razorpayOrder.id,
            handler: async function (response) {
                console.log("🎯 Razorpay response received:", response);

                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

                // ✅ This log is critical — copy these values to test locally
                console.log("🧾 Use these in backend/local test:");
                console.log("razorpay_order_id:", razorpay_order_id);
                console.log("razorpay_payment_id:", razorpay_payment_id);
                console.log("razorpay_signature:", razorpay_signature);

                try {
                    const verificationResponse = await fetch('https://webloomecommerce.vercel.app/orders/razorpay/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            razorpay_order_id,
                            razorpay_payment_id,
                            razorpay_signature
                        })
                    });

                    const verificationResult = await verificationResponse.json();

                    if (verificationResult.verified) {
                        const order = {
                            user: loggedInUser._id,
                            item: cartItems,
                            address: selectedAddress,
                            paymentMode: 'CARD',
                            total: finalTotal,
                            razorpay_payment_id,
                            razorpay_order_id,
                            razorpay_signature,
                            paymentStatus: 'Paid'
                        };
                        dispatch(createOrderAsync(order));
                    } else {
                        setPaymentError('Payment verification failed. Please contact support.');
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    setPaymentError('Payment verification failed. Please contact support.');
                }
            }
            ,
            prefill: {
                name: loggedInUser.name,
                email: loggedInUser.email,
                contact: selectedAddress?.phoneNumber || ''
            },
            notes: {
                address: `${selectedAddress?.street}, ${selectedAddress?.city}, ${selectedAddress?.state}`,
                user_id: loggedInUser._id
            },
            theme: {
                color: theme.palette.primary.main
            },
            modal: {
                ondismiss: function () {
                    setPaymentError('Payment cancelled by user.')
                }
            }
        }

        try {
            const paymentObject = new window.Razorpay(options)

            // Handle payment failures
            paymentObject.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                setPaymentError(`Payment failed: ${response.error.description || 'Unknown error'}`)
            });

            paymentObject.open()
        } catch (error) {
            console.error('Error creating Razorpay instance:', error);
            setPaymentError('Failed to initialize payment. Please try again.')
        }
    }

    const handleCreateOrder = async () => {
        if (!selectedAddress) {
            setPaymentError('Please select a delivery address.')
            return
        }

        setPaymentError('')

        if (selectedPaymentMethod === 'COD') {
            const order = {
                user: loggedInUser._id,
                item: cartItems,
                address: selectedAddress,
                paymentMode: 'COD',
                total: finalTotal,
                paymentStatus: 'Pending'
            }
            dispatch(createOrderAsync(order))
        } else if (selectedPaymentMethod === 'CARD') {
            // Create Razorpay order with amount in paise (integer)
            const amountInPaise = convertToPaise(finalTotal)

            const razorpayOrderData = {
                amount: amountInPaise, // Convert to paise and ensure it's an integer
                currency: 'INR',
                receipt: `order_${Date.now()}`,
                notes: {
                    user_id: loggedInUser._id,
                    address: selectedAddress?.street,
                    final_total: finalTotal.toString(), // Store original amount for reference
                    order_total: orderTotal.toString(),
                    shipping: shippingAmount.toString(),
                    taxes: taxAmount.toString()
                }
            }

            try {
                console.log('💰 Order Breakdown:');
                console.log('Order Total:', formatCurrency(orderTotal));
                console.log('Shipping:', formatCurrency(shippingAmount));
                console.log('Taxes:', formatCurrency(taxAmount));
                console.log('Final Total:', formatCurrency(finalTotal));
                console.log('Amount in Paise:', amountInPaise);
                console.log('Creating Razorpay order with data:', razorpayOrderData);

                const response = await dispatch(createRazorpayOrderAsync(razorpayOrderData))

                console.log('Razorpay order response:', response);

                if (response.payload && response.payload.id) {
                    await handleRazorpayPayment(response.payload)
                } else {
                    throw new Error('Invalid response from Razorpay order creation')
                }
            } catch (error) {
                console.error('Razorpay order creation error:', error);
                setPaymentError('Failed to initiate payment. Please try again.')
            }
        }
    }

    // Price breakdown component
    // Price breakdown component - Clean and formal
    const PriceBreakdown = () => (
        <Stack spacing={2} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
            <Typography variant="h6">Order Summary</Typography>

            <Stack direction="row" justifyContent="space-between">
                <Typography>Subtotal:</Typography>
                <Typography>{formatCurrency(orderTotal)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
                <Typography>Shipping:</Typography>
                <Typography>{formatCurrency(shippingAmount)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
                <Typography>Tax:</Typography>
                <Typography>{formatCurrency(taxAmount)}</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">{formatCurrency(finalTotal)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Amount Payable:</Typography>
                <Typography variant="body2" color="text.secondary">₹{formatInteger(finalTotal)}</Typography>
            </Stack>
        </Stack>
    )

    return (
        <Stack flexDirection={'row'} p={2} rowGap={10} justifyContent={'center'} flexWrap={'wrap'} mb={'5rem'} mt={2} columnGap={4} alignItems={'flex-start'}>

            {/* left box */}
            <Stack rowGap={4}>

                {/* heading */}
                <Stack flexDirection={'row'} columnGap={is480 ? 0.3 : 1} alignItems={'center'}>
                    <motion.div whileHover={{ x: -5 }}>
                        <IconButton component={Link} to={"/cart"}><ArrowBackIcon fontSize={is480 ? "medium" : 'large'} /></IconButton>
                    </motion.div>
                    <Typography variant='h4'>Shipping Information</Typography>
                </Stack>

                {/* Payment Error Alert */}
                {paymentError && (
                    <Alert severity="error" onClose={() => setPaymentError('')}>
                        {paymentError}
                    </Alert>
                )}

                {/* address form */}
                <Stack component={'form'} noValidate rowGap={2} onSubmit={handleSubmit(handleAddAddress)}>
                    <Stack>
                        <Typography gutterBottom>Type</Typography>
                        <TextField placeholder='Eg. Home, Business' {...register("type", { required: true })} />
                    </Stack>

                    <Stack>
                        <Typography gutterBottom>Street</Typography>
                        <TextField {...register("street", { required: true })} />
                    </Stack>

                    <Stack>
                        <Typography gutterBottom>Country</Typography>
                        <TextField {...register("country", { required: true })} />
                    </Stack>

                    <Stack>
                        <Typography gutterBottom>Phone Number</Typography>
                        <TextField type='number' {...register("phoneNumber", { required: true })} />
                    </Stack>

                    <Stack flexDirection={'row'}>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>City</Typography>
                            <TextField {...register("city", { required: true })} />
                        </Stack>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>State</Typography>
                            <TextField {...register("state", { required: true })} />
                        </Stack>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>Postal Code</Typography>
                            <TextField type='number' {...register("postalCode", { required: true })} />
                        </Stack>
                    </Stack>

                    <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={1}>
                        <LoadingButton loading={status === 'pending'} type='submit' variant='contained'>add</LoadingButton>
                        <Button color='error' variant='outlined' onClick={() => reset()}>Reset</Button>
                    </Stack>
                </Stack>

                {/* existing address */}
                <Stack rowGap={3}>
                    <Stack>
                        <Typography variant='h6'>Address</Typography>
                        <Typography variant='body2' color={'text.secondary'}>Choose from existing Addresses</Typography>
                    </Stack>

                    <Grid container gap={2} width={is900 ? "auto" : '50rem'} justifyContent={'flex-start'} alignContent={'flex-start'}>
                        {
                            addresses.map((address, index) => (
                                <FormControl item key={address._id}>
                                    <Stack p={is480 ? 2 : 2} width={is480 ? '100%' : '20rem'} height={is480 ? 'auto' : '15rem'} rowGap={2} component={Paper} elevation={1}>

                                        <Stack flexDirection={'row'} alignItems={'center'}>
                                            <Radio checked={selectedAddress === address} name='addressRadioGroup' value={selectedAddress} onChange={(e) => setSelectedAddress(addresses[index])} />
                                            <Typography>{address.type}</Typography>
                                        </Stack>

                                        {/* details */}
                                        <Stack>
                                            <Typography>{address.street}</Typography>
                                            <Typography>{address.state}, {address.city}, {address.country}, {address.postalCode}</Typography>
                                            <Typography>{address.phoneNumber}</Typography>
                                        </Stack>
                                    </Stack>
                                </FormControl>
                            ))
                        }
                    </Grid>
                </Stack>

                {/* payment methods */}
                <Stack rowGap={3}>
                    <Stack>
                        <Typography variant='h6'>Payment Methods</Typography>
                        <Typography variant='body2' color={'text.secondary'}>Please select a payment method</Typography>
                    </Stack>

                    <Stack rowGap={2}>
                        <Stack flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                            <Radio value={selectedPaymentMethod} name='paymentMethod' checked={selectedPaymentMethod === 'COD'} onChange={() => setSelectedPaymentMethod('COD')} />
                            <Typography>Cash on Delivery</Typography>
                        </Stack>

                        <Stack flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                            <Radio value={selectedPaymentMethod} name='paymentMethod' checked={selectedPaymentMethod === 'CARD'} onChange={() => setSelectedPaymentMethod('CARD')} />
                            <Typography>Card Payment (Razorpay)</Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>

            {/* right box */}
            <Stack width={is900 ? '100%' : 'auto'} alignItems={is900 ? 'flex-start' : ''}>
                <Typography variant='h4'>Order summary</Typography>
                <Cart checkout={true} />

                {/* Price Breakdown */}
                <PriceBreakdown />

                <LoadingButton
                    fullWidth
                    loading={orderStatus === 'pending' || razorpayOrderStatus === 'pending'}
                    variant='contained'
                    onClick={handleCreateOrder}
                    size='large'
                    disabled={!selectedAddress}
                >
                    {selectedPaymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                </LoadingButton>
            </Stack>
        </Stack>
    )
}