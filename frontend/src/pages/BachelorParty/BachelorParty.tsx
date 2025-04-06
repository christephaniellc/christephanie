import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const BachelorParty: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Bachelor Party Planning
        </Typography>
        
        <StyledPaper>
          <Typography variant="h5" component="h2" gutterBottom>
            Welcome to the Bachelor Party Planning Page!
          </Typography>
          <Typography variant="body1" paragraph>
            This page is currently under construction. Soon you'll find information about the bachelor party, activities, logistics, and more.
          </Typography>
          <Typography variant="body1">
            Stay tuned for updates!
          </Typography>
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default BachelorParty;
