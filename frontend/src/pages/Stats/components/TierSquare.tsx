import { Box, Typography } from '@mui/material';
import { getTierDetails } from './StatsHelpers';

interface TierSquareProps {
  tier?: string | null;
  size?: number;
}

const TierSquare = ({ tier, size = 24 }: TierSquareProps) => {
  const { color, priority } = getTierDetails(tier);
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: color,
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '3px',
        border: '1px solid rgba(0,0,0,0.8)',
        boxShadow: 2,
        fontWeight: 'bold',
        fontSize: size * 0.5,
        userSelect: 'none',
      }}
      title={tier || 'No tier assigned'}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 'bold',
          fontSize: size * 0.5,
          lineHeight: 1
        }}
      >
        {priority === 999 ? '-' : priority}
      </Typography>
    </Box>
  );
};

export default TierSquare;