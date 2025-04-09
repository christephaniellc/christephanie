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
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  // Better mobile optimization
  maxWidth: '400px',
  margin: '0 auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: 'none'
  }
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

const CardDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

interface GiftCategoryCardProps {
  option: GiftOption;
  customAmount: string;
  onCustomAmountChange: (id: string, value: string) => void;
  onContribute: (id: string) => void;
}

const GiftCategoryCard: React.FC<GiftCategoryCardProps> = ({
  option,
  customAmount,
  onCustomAmountChange,
  onContribute
}) => {
  const theme = useTheme();
  const IconComponent = option.icon;

  return (
    <RegistryCard elevation={4}>
      <CardContentStyled
            sx={{   
              width: '100%',  
              height: '100%',       
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
        <IconWrapper>
          <IconComponent />
        </IconWrapper>
        <Typography variant="h5" component="h3" align="center" gutterBottom>
          {option.title}
        </Typography>
        <CardDescription variant="body2" color="textSecondary">
          {option.description}
        </CardDescription>        
        <CardActions>
          <Box
            sx={{              
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1, // adds space between TextField and Button
            }}
          >
            <TextField
              fullWidth
              label="Amount"
              variant="outlined"
              value={customAmount || ''}
              onChange={(e) => onCustomAmountChange(option.id, e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ 
                fontSize: '1.8rem',
                //height
                mr: 1
                //mb: 2 
              }}
            />
            <Button 
              variant="contained" 
              color="secondary"
              disabled={!customAmount}
              onClick={() => onContribute(option.id)}
              sx={{
                px: 4, // horizontal padding (left + right)
                py: 2, // vertical padding
                minWidth: 'auto', // allows button to shrink to content + padding
              }}
            >
              Contribute
            </Button>
          </Box>
        </CardActions>
      </CardContentStyled>
    </RegistryCard>
  );
};

export default GiftCategoryCard;