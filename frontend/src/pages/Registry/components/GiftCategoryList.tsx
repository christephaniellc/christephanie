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
}));

interface GiftCategoryListProps {
  giftOptions: GiftOption[];
  selectedAmounts: Record<string, number | null>;
  customAmounts: Record<string, string>;
  onAmountSelect: (id: string, amount: number) => void;
  onCustomAmountChange: (id: string, value: string) => void;
  onContribute: (id: string) => void;
}

const GiftCategoryList: React.FC<GiftCategoryListProps> = ({
  giftOptions,
  selectedAmounts,
  customAmounts,
  onAmountSelect,
  onCustomAmountChange,
  onContribute
}) => {
  return (
    <>
      <SectionTitle variant="h2">Contribute to Our Wedding</SectionTitle>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {giftOptions.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.id}>
            <GiftCategoryCard
              option={option}
              selectedAmount={selectedAmounts[option.id]}
              customAmount={customAmounts[option.id]}
              onAmountSelect={onAmountSelect}
              onCustomAmountChange={onCustomAmountChange}
              onContribute={onContribute}
            />
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 4 }} />
    </>
  );
};

export default GiftCategoryList;