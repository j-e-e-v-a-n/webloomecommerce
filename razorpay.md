# Testing Guide for Razorpay Integration

## Test Payment Flow

### 1. Test Card Details
Use these test card details provided by Razorpay:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3-digit number (e.g., `123`)
- Name: Any name

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3-digit number

### 2. Test UPI IDs
- Success: `success@razorpay`
- Failure: `failure@razorpay`

### 3. Test Wallets
- Success: Use any test wallet and enter OTP as `123456`
- Failure: Use any test wallet and enter OTP as `654321`

## Testing Checklist

### Frontend Testing
- [ ] Address selection works correctly
- [ ] Payment method selection (COD vs Card) works
- [ ] Razorpay checkout modal opens for card payments
- [ ] Payment success redirects to order success page
- [ ] Payment failure shows appropriate error message
- [ ] Order creation works for both COD and card payments
- [ ] Cart is cleared after successful order
- [ ] Loading states work correctly

### Backend Testing
- [ ] Razorpay order creation endpoint works
- [ ] Payment verification endpoint works
- [ ] Order saving with Razorpay fields works
- [ ] Order status updates correctly based on payment
- [ ] Error handling works for payment failures
- [ ] Webhook handling (if implemented)

## API Testing with Postman/curl

### Create Razorpay Order
```bash
curl -X POST http://localhost:8000/orders/razorpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "order_test_123",
    "notes": {
      "user_id": "test_user_id"
    }
  }'
```

### Verify Payment
```bash
curl -X POST http://localhost:8000/orders/razorpay/verify \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_test_id",
    "razorpay_payment_id": "pay_test_id",
    "razorpay_signature": "test_signature"
  }'
```

### Create Order with Payment Info
```bash
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "user": "user_id",
    "item": [{"product": {"name": "Test Product", "price": 500}, "quantity": 1}],
    "address": {"street": "Test Street", "city": "Test City"},
    "paymentMode": "CARD",
    "total": 500,
    "razorpay_order_id": "order_test_id",
    "razorpay_payment_id": "pay_test_id",
    "razorpay_signature": "test_signature"
  }'
```

## Common Issues and Solutions

### 1. Razorpay Script Not Loading
- Check internet connection
- Verify Razorpay CDN is accessible
- Check browser console for errors

### 2. Payment Modal Not Opening
- Verify `REACT_APP_RAZORPAY_KEY_ID` is set correctly
- Check if Razorpay script loaded successfully
- Verify order creation was successful

### 3. Payment Verification Failing
- Check if `RAZORPAY_KEY_SECRET` is set correctly in backend
- Verify signature generation logic
- Check if all required fields are being sent

### 4. Order Not Created After Payment
- Check if payment verification is successful
- Verify order creation logic in payment handler
- Check for any console errors

## Environment-Specific Testing

### Development Environment
- Use Razorpay test keys
- Test with various payment methods
- Test failure scenarios

### Production Environment
- Use Razorpay live keys
- Test with small amounts initially
- Monitor payment success rates
- Set up proper error logging

## Monitoring and Logging

### Backend Logging
```javascript
// Add to your order controller
console.log('Razorpay Order Created:', order)
console.log('Payment Verification:', { isAuthentic, paymentId })
```

### Frontend Logging
```javascript
// Add to your checkout component
console.log('Razorpay Order Response:', response)
console.log('Payment Success:', paymentResponse)
```

## Security Best Practices

1. **Never log sensitive data** (key secrets, signatures)
2. **Always verify payments** on the server side
3. **Use HTTPS** in production
4. **Implement rate limiting** for payment endpoints
5. **Set up proper error handling** to avoid information leakage