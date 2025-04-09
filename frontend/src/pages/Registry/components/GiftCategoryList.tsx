import React from 'react';
import { Grid, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import GiftCategoryCard from './GiftCategoryCard';
import { GiftOption } from '@/store/registry';

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontFamily: 'Snowstorm, sans-serif',
  fontSize: '1.8rem',
  color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.dark,
  textAlign: 'center',
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  }
}));

const GridContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 1)
  }
}));

interface GiftCategoryListProps {
  giftOptions: GiftOption[];
  customAmounts: Record<string, string>;
  onCustomAmountChange: (id: string, value: string) => void;
  onContribute: (id: string) => void;
}

const GiftCategoryList: React.FC<GiftCategoryListProps> = ({
  giftOptions,
  customAmounts,
  onCustomAmountChange,
  onContribute
}) => {
  return (
    <>
      <SectionTitle variant="h2">Contribute to Our Wedding</SectionTitle>
      
      <GridContainer container spacing={3} sx={{ mb: 6 }}>
        {giftOptions.map((option) => (
          <Grid item xs={12} sm={6} md={6} key={option.id} sx={{ 
            mb: { xs: 2, sm: 0 }, // Add more bottom margin on mobile
          }}>
            <GiftCategoryCard
              option={option}
              customAmount={customAmounts[option.id]}
              onCustomAmountChange={onCustomAmountChange}
              onContribute={onContribute}
            />
          </Grid>
        ))}
      </GridContainer>
      
      <Divider sx={{ my: 4 }} />
    </>
  );
};

export default GiftCategoryList;