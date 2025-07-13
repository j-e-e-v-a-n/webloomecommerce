import React from 'react';
import { Container, Typography } from '@mui/material';

const ShippingPolicy = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Shipping Policy</Typography>
    <Typography paragraph>
      We aim to deliver all products within 5-7 business days from the date of order.
    </Typography>
    <Typography paragraph>
      We currently ship only within India. Shipping charges may vary depending on the location and order size.
    </Typography>
  </Container>
);

export default ShippingPolicy;
