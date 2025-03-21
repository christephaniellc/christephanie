import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Menu, 
  MenuItem, 
  List, 
  ListItemButton,
  ListItemText, 
  Badge, 
  Avatar, 
  LinearProgress,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SortIcon from '@mui/icons-material/Sort';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FamilyUnitDto, InvitationResponseEnum } from '@/types/api';
import { SortOption } from '../types/types';

interface FamilyListProps {
  familyStats: {
    totalFamilies: number;
    totalGuests: number;
    interestedGuests: number;
  };
  filteredFamilies: FamilyUnitDto[];
  allFamilies: FamilyUnitDto[];
  searchQuery: string;
  sortOption: SortOption;
  sortAnchorEl: HTMLElement | null;
  selectedFamily: FamilyUnitDto | null;
  loading: boolean;
  error: string | null;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSortClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleSortClose: (option?: SortOption) => void;
  handleFamilySelect: (family: FamilyUnitDto) => void;
  handleRefresh: () => void;
  calculateCompletionPercentage: (family: FamilyUnitDto) => number;
  isFetching: boolean;
}

export const FamilyList: React.FC<FamilyListProps> = ({
  familyStats,
  filteredFamilies,
  allFamilies,
  searchQuery,
  sortOption,
  sortAnchorEl,
  selectedFamily,
  loading,
  error,
  handleSearchChange,
  handleSortClick,
  handleSortClose,
  handleFamilySelect,
  handleRefresh,
  calculateCompletionPercentage,
  isFetching
}) => {
  return (
    <Box sx={{ 
      width: 350, 
      bgcolor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Search and sort controls */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search families..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<SortIcon />}
            onClick={handleSortClick}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Sort
          </Button>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={() => handleSortClose()}
          >
            <MenuItem 
              onClick={() => handleSortClose('name')}
              selected={sortOption === 'name'}
            >
              Sort by Family Name
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('invitationCode')}
              selected={sortOption === 'invitationCode'}
            >
              Sort by Invitation Code
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('guestCount')}
              selected={sortOption === 'guestCount'}
            >
              Sort by Guest Count
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('responseStatus')}
              selected={sortOption === 'responseStatus'}
            >
              Sort by Response Status
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('completionStatus')}
              selected={sortOption === 'completionStatus'}
            >
              Sort by Completion Status
            </MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          Currently sorting by: <strong>
            {sortOption === 'name' ? 'Family Name' : 
             sortOption === 'invitationCode' ? 'Invitation Code' :
             sortOption === 'guestCount' ? 'Guest Count' :
             sortOption === 'responseStatus' ? 'Response Status' :
             'Completion Status'}
          </strong>
        </Typography>
      </Box>
      
      {/* Families list */}
      {loading || isFetching ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, p: 3 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading families...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, color: 'error.main', textAlign: 'center' }}>
          <Typography variant="body2" color="error" gutterBottom>{error}</Typography>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </Box>
      ) : (
        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {filteredFamilies.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>No families found</Typography>
              {searchQuery && (
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
                >
                  Clear Search
                </Button>
              )}
            </Box>
          ) : (
            filteredFamilies.map((family) => {
              const completionPercent = calculateCompletionPercentage(family);
              
              // Calculate how many guests have responded as interested
              const interestedCount = family.guests?.filter(g => 
                g.rsvp?.invitationResponse === InvitationResponseEnum.Interested
              ).length || 0;
              
              return (
                <ListItemButton
                  key={family.invitationCode}
                  selected={selectedFamily?.invitationCode === family.invitationCode}
                  onClick={() => handleFamilySelect(family)}
                  sx={{ 
                    borderRadius: 1,
                    my: 0.5,
                    mx: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.dark',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      }
                    }
                  }}
                >
                  <Badge
                    badgeContent={family.guests?.length || 0}
                    color="secondary"
                    sx={{ mr: 2 }}
                    overlap="circular"
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: interestedCount > 0 ? 'success.dark' : 'primary.dark', 
                        width: 40, 
                        height: 40, 
                        fontSize: '1rem' 
                      }}
                    >
                      {family.unitName?.substring(0, 1) || '?'}
                    </Avatar>
                  </Badge>
                  
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography noWrap component="span" sx={{ flexGrow: 1 }}>
                          {family.unitName || 'Unnamed Family'}
                        </Typography>
                        {interestedCount > 0 && (
                          <Box component="span" sx={{ display: 'flex', ml: 1 }}>
                            <FavoriteIcon 
                              fontSize="small" 
                              color="error"
                              sx={{ fontSize: '1rem' }} 
                            />
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" component="span">
                          Code: {family.invitationCode}
                        </Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={completionPercent}
                            sx={{ 
                              height: 6, 
                              borderRadius: 1, 
                              flexGrow: 1,
                              mr: 1,
                              backgroundColor: 'rgba(255,255,255,0.1)'
                            }}
                          />
                          <Typography variant="caption">{completionPercent}%</Typography>
                        </Box>
                      </Box>
                    }
                    primaryTypographyProps={{
                      style: { textOverflow: 'ellipsis' }
                    }}
                  />
                </ListItemButton>
              );
            })
          )}
        </List>
      )}
      
      {/* Stats footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredFamilies.length} of {allFamilies.length} families • 
          {filteredFamilies.reduce((sum, family) => sum + (family.guests?.length || 0), 0)} guests
        </Typography>
      </Box>
    </Box>
  );
};