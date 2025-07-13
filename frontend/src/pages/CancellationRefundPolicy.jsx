import React from 'react';
import { Container, Typography } from '@mui/material';

const CancellationRefundPolicy = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Cancellation & Refund Policy</Typography>
    <Typography paragraph>
      Once an order is placed, it cannot be cancelled. Refunds will only be issued if the product delivered
      is damaged, defective, or not as described.
    </Typography>
    <Typography paragraph>
      All refunds will be processed through Razorpay within 7-10 business days.
    </Typography>
  </Container>
);

export default CancellationRefundPolicy;
