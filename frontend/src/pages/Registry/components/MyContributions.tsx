import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  styled,
  useTheme
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import { apiState } from '@/context/ApiContext';
import { ContributionDto } from '@/types/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Styled components
const ContributionsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper 
    : '#fff',
  boxShadow: theme.shadows[2],
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden'
}));

const NoContributionsMessage = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  fontStyle: 'italic'
}));

const ContributionItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2, 1),
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const ContributionAmount = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.secondary.main
}));

const ContributionDate = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem'
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  fontFamily: 'Snowstorm, sans-serif',
  textAlign: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '2px',
    backgroundColor: theme.palette.secondary.main,
  }
}));

interface MyContributionsProps {
  // No props needed at this time
}

const MyContributions: React.FC<MyContributionsProps> = () => {
  const [contributions, setContributions] = useState<ContributionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const api = useRecoilValue(apiState);
  const theme = useTheme();

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        const data = await api.getMyContributions();
        setContributions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching contributions:', err);
        setError('Failed to load your contributions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [api]);

  // Format date from ISO string
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format currency amount (cents to dollars)
  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  // If there are no contributions, don't render the component
  if (!loading && contributions.length === 0) {
    return null;
  }

  return (
    <ContributionsContainer>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        cursor: 'pointer',
        mb: 1
      }}
      onClick={() => setExpanded(!expanded)}>
        <SectionTitle variant="h5">
          Your Contributions
        </SectionTitle>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Collapse in={expanded}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : contributions.length === 0 ? (
          <NoContributionsMessage>
            You haven't made any contributions yet.
          </NoContributionsMessage>
        ) : (
          <List disablePadding>
            {contributions.map((contribution) => (
              <ContributionItem key={contribution.paymentIntentId} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {contribution.giftCategory}
                      </Typography>
                      <ContributionAmount>
                        {formatAmount(contribution.amount)}
                      </ContributionAmount>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <ContributionDate>
                        {formatDate(contribution.timestamp)}
                      </ContributionDate>
                      {contribution.giftNotes && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                          "{contribution.giftNotes}"
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ContributionItem>
            ))}
          </List>
        )}
        
        {contributions.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Contributed: {formatAmount(contributions.reduce((sum, item) => sum + item.amount, 0))}
            </Typography>
          </Box>
        )}
      </Collapse>
    </ContributionsContainer>
  );
};

export default MyContributions;