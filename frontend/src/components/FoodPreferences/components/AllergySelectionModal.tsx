import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  darken, 
  useTheme,
  Dialog
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { FoodAllergyIconProps } from '@/components/Allergies';
import AllergyButton from './AllergyButton';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';

interface AllergySelectionModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  guestId: string;
  allergyIconProps: FoodAllergyIconProps[];
  handleGuestFoodAllergy: (allergyName: string) => void;
}

const AllergySelectionModal: React.FC<AllergySelectionModalProps> = ({
  modalOpen,
  setModalOpen,
  guestId,
  allergyIconProps,
  handleGuestFoodAllergy,
}) => {
  const theme = useTheme();
  const guest = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Filter allergies based on search term
  const filteredAllergies = useMemo(() => {
    if (!searchTerm) return allergyIconProps;
    
    return allergyIconProps.filter(allergy => 
      allergy.allergyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allergyIconProps, searchTerm]);
  
  // Organize allergies - selected ones at the top
  const organizedAllergies = useMemo(() => {
    // First, split into selected and unselected
    const selected = filteredAllergies.filter(allergy => 
      guest.preferences.foodAllergies.includes(allergy.allergyName)
    );
    
    const unselected = filteredAllergies.filter(allergy => 
      !guest.preferences.foodAllergies.includes(allergy.allergyName)
    );
    
    // Combine with selected ones first
    return [...selected, ...unselected];
  }, [filteredAllergies, guest?.preferences?.foodAllergies]);
  
  return (
    <Dialog
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.9)',
          border: `1px solid ${theme.palette.warning.main}`,
          borderRadius: 2,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
          minHeight: '80vh',
          '& .MuiDialogTitle-root': {
            backgroundColor: 'rgba(0,0,0,0.7)',
          }
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="warning.main">
          Select Allergies
        </Typography>
        <Button 
          onClick={() => setModalOpen(false)}
          variant="contained"
          color="warning"
          sx={{
            paddingX: 3,
            fontWeight: 'bold',
            border: `1px solid ${theme.palette.warning.main}`,
            '&:hover': {
              backgroundColor: darken(theme.palette.warning.main, 0.1),
            }
          }}
        >
          Save Allergies
        </Button>
      </Box>
      
      {/* Search input */}
      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search allergies..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: 1.5,
              border: `1px solid ${darken(theme.palette.grey[700], 0.2)}`,
              '&.Mui-focused': {
                border: `1px solid ${theme.palette.warning.main}`,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.warning.main,
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.4)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              }
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary,
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <WarningAmber color="warning" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Allergies list - selected ones at the top */}
      <Box
        sx={{
          px: 2,
          pb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          maxHeight: '50vh',
          overflowY: 'auto',
        }}
      >
        {searchTerm && !filteredAllergies.length ? (
          <Box width="100%" mt={2}>
            <Typography>No matches found. Add a custom allergy below.</Typography>
          </Box>
        ) : (
          organizedAllergies.map((allergy) => (
            <AllergyButton
              key={allergy.allergyName}
              allergy={allergy}
              guestId={guestId}
              handleGuestFoodAllergy={handleGuestFoodAllergy}
            />
          ))
        )}
      </Box>
      
      {/* Add custom allergy section */}
      <Box 
        sx={{ 
          borderTop: `1px solid ${theme.palette.divider}`, 
          p: 2,
          mt: 'auto'
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Don't see your allergy? Add a custom one:
        </Typography>
        <Button 
          onClick={() => {
            if (searchTerm.trim()) {
              handleGuestFoodAllergy(searchTerm.trim());
              setSearchTerm('');
            }
          }}
          variant="outlined" 
          color="warning"
          startIcon={<WarningAmber />}
          size="small"
          disabled={!searchTerm.trim()}
          sx={{ 
            mt: 1, 
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        >
          {searchTerm.trim() ? `Add "${searchTerm.trim()}" Allergy` : 'Add Custom Allergy'}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AllergySelectionModal;