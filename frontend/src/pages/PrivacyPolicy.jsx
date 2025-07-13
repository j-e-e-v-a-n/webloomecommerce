import React from 'react';
import { Container, Typography } from '@mui/material';

const PrivacyPolicy = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Privacy Policy</Typography>
    <Typography paragraph>
      We respect your privacy and are committed to protecting your personal data.
      This policy outlines how we collect, use, and protect your information when you use our website.
    </Typography>
    <Typography paragraph>
      We do not share your personal information with third parties except as necessary to process payments
      or comply with the law. Razorpay handles all payment processing and ensures data safety.
    </Typography>
  </Container>
);

export default PrivacyPolicy;
