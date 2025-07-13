import React from 'react';
import { Container, Typography } from '@mui/material';

const TermsAndConditions = () => (
  <Container sx={{ py: 4 }}>
    <Typography variant="h4" gutterBottom>Terms and Conditions</Typography>
    <Typography paragraph>
      By using our website, you agree to comply with and be bound by the following terms and conditions.
    </Typography>
    <Typography paragraph>
      All products listed are subject to availability. We reserve the right to change pricing and
      product details without prior notice.
    </Typography>
  </Container>
);

export default TermsAndConditions;
