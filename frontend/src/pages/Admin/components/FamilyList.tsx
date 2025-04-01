import { useState } from 'react';
import { 
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Divider
} from '@mui/material';
import { FamilyUnitDto, InvitationResponseEnum } from '@/types/api';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import { styled } from '@mui/material/styles';

// Define sort options
export type SortOption = 'lastUpdated' | 'invitationStatus' | 'default';

interface FamilyListProps {
  families: FamilyUnitDto[];
  selectedFamily: FamilyUnitDto | null;
  onFamilySelect: (family: FamilyUnitDto) => void;
  sortOption: SortOption;
  onSortChange: (event: SelectChangeEvent) => void;
}

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.primary.dark 
      : theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? theme.palette.primary.dark 
        : theme.palette.primary.light,
    }
  }
}));

const FamilyList: React.FC<FamilyListProps> = ({ 
  families, 
  selectedFamily, 
  onFamilySelect, 
  sortOption,
  onSortChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter families based on search term
  const filteredFamilies = searchTerm.trim() === '' 
    ? families 
    : families.filter(family => {
        const searchLower = searchTerm.toLowerCase();
        
        // Search by family unit name
        if (family.unitName?.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search by invitation code
        if (family.invitationCode?.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search by guest names
        if (family.guests?.some(
          guest => guest.firstName?.toLowerCase().includes(searchLower) || 
                  guest.lastName?.toLowerCase().includes(searchLower)
        )) {
          return true;
        }
        
        return false;
      });

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Get RSVP status for family
  const getFamilyStatus = (family: FamilyUnitDto) => {
    if (!family.guests || family.guests.length === 0) {
      return { label: 'No Guests', color: 'default' as const };
    }
    
    const hasDeclined = family.guests.some(
      guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined
    );
    
    if (hasDeclined) {
      return { label: 'Declined', color: 'error' as const };
    }
    
    const hasInterested = family.guests.some(
      guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested
    );
    
    if (hasInterested) {
      return { label: 'Interested', color: 'success' as const };
    }
    
    const hasRsvped = family.guests.some(
      guest => guest.rsvp?.wedding !== undefined
    );
    
    if (hasRsvped) {
      return { label: 'RSVP\'d', color: 'primary' as const };
    }
    
    return { label: 'Pending', color: 'warning' as const };
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search & Sort Controls */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search families..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <ClearIcon 
                  sx={{ cursor: 'pointer' }} 
                  onClick={handleClearSearch}
                />
              </InputAdornment>
            ) : null
          }}
          sx={{ mb: 1 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            {filteredFamilies.length} families found
          </Typography>
          
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel id="sort-by-label">Sort by</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortOption}
              label="Sort by"
              onChange={onSortChange}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="lastUpdated">Last Updated</MenuItem>
              <MenuItem value="invitationStatus">RSVP Status</MenuItem>
              <MenuItem value="default">Tier & Name</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Family List */}
      <List sx={{ 
        flex: 1, 
        overflowY: 'auto',
        '& .MuiListItem-root': { p: 0.5 } 
      }}>
        {filteredFamilies.length > 0 ? (
          filteredFamilies.map((family) => {
            const status = getFamilyStatus(family);
            
            return (
              <ListItem key={family.invitationCode} disablePadding>
                <StyledListItemButton
                  selected={selectedFamily?.invitationCode === family.invitationCode}
                  onClick={() => onFamilySelect(family)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {family.unitName || 'Unnamed Family'}
                        </Typography>
                        <Chip 
                          label={status.label} 
                          color={status.color} 
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" component="span">
                          {family.invitationCode}
                        </Typography>
                        {family.tier && (
                          <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                            • {family.tier}
                          </Typography>
                        )}
                        {family.guests && (
                          <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                            • {family.guests.length} {family.guests.length === 1 ? 'guest' : 'guests'}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </StyledListItemButton>
              </ListItem>
            );
          })
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No families found
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default FamilyList;