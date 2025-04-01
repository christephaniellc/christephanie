import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  TextField,
  InputAdornment,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { GiftOption } from '@/store/registry';

// Styled components
const RegistryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(145deg, ${alpha('#191919', 0.9)}, ${alpha('#111', 0.9)})` 
    : `linear-gradient(145deg, ${alpha('#fff', 0.9)}, ${alpha('#f5f5f5', 0.9)})`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(1.5),
  '& > svg': {
    fontSize: '3rem',
    color: theme.palette.primary.main,
  },
}));

// Define selected property interface for AmountButton
interface AmountButtonProps {
  selected?: boolean;
}

const AmountButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<AmountButtonProps>(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  fontWeight: selected ? 'bold' : 'normal',
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected ? '#fff' : theme.palette.text.primary,
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
  },
}));

const CardDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

interface GiftCategoryCardProps {
  option: GiftOption;
  selectedAmount: number | null;
  customAmount: string;
  onAmountSelect: (id: string, amount: number) => void;
  onCustomAmountChange: (id: string, value: string) => void;
  onContribute: (id: string) => void;
}

const GiftCategoryCard: React.FC<GiftCategoryCardProps> = ({
  option,
  selectedAmount,
  customAmount,
  onAmountSelect,
  onCustomAmountChange,
  onContribute
}) => {
  const theme = useTheme();
  const IconComponent = option.icon;

  return (
    <RegistryCard elevation={4}>
      <CardContentStyled>
        <IconWrapper>
          <IconComponent />
        </IconWrapper>
        <Typography variant="h5" component="h3" align="center" gutterBottom>
          {option.title}
        </Typography>
        <CardDescription variant="body2" color="textSecondary">
          {option.description}
        </CardDescription>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
          {option.suggestedAmounts.map((amount) => (
            <AmountButton 
              key={amount} 
              variant="outlined" 
              size="small"
              selected={selectedAmount === amount}
              onClick={() => onAmountSelect(option.id, amount)}
            >
              ${amount}
            </AmountButton>
          ))}
        </Box>
        <TextField
          fullWidth
          label="Custom Amount"
          variant="outlined"
          size="small"
          value={customAmount || ''}
          onChange={(e) => onCustomAmountChange(option.id, e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={{ mb: 2 }}
        />
      </CardContentStyled>
      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button 
          variant="contained" 
          color="primary"
          disabled={!selectedAmount && !customAmount}
          onClick={() => onContribute(option.id)}
        >
          Contribute
        </Button>
      </CardActions>
    </RegistryCard>
  );
};

export default GiftCategoryCard;