import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Typography
} from '@mui/material';
import { 
  WarningAmber, 
  Close, 
  ReportProblem 
} from '@mui/icons-material';
import { useFamily } from '@/store/family';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';

interface AddAllergyButtonProps {
  guestId?: string;
}

const AddAllergyButton: React.FC<AddAllergyButtonProps> = ({ guestId }) => {
  const [open, setOpen] = useState(false);
  const [allergyName, setAllergyName] = useState('');
  const [_, familyActions] = useFamily();
  const loggedInUser = useRecoilValue(userState);
  
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAllergyName('');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllergyName(event.target.value);
  };

  const handleAddAllergy = () => {
    if (allergyName.trim() === '') return;
    
    const targetGuestId = guestId || loggedInUser.guestId;
    
    if (targetGuestId) {
      // Get current allergies for the guest and add the new one
      familyActions.updateFamilyGuestFoodAllergies(
        targetGuestId,
        [allergyName]
      );
    }
    
    handleClose();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddAllergy();
    }
  };

  return (
    <>
      <Button 
        onClick={handleOpen} 
        variant="outlined" 
        color="warning"
        startIcon={<ReportProblem />}
        size="small"
        sx={{ 
          mt: 1, 
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.6)',
        }}
      >
        Add Custom Allergy
      </Button>
      
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.9)',
            border: '1px solid',
            borderColor: 'warning.main',
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="h6" color="warning.main">
            Add Custom Allergy
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Allergy Name"
            type="text"
            fullWidth
            variant="filled"
            value={allergyName}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: <WarningAmber color="warning" sx={{ mr: 1 }} />,
            }}
            helperText="Enter a food allergy or dietary restriction that's not in the list"
            color="warning"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} variant="text">
            Cancel
          </Button>
          <Button 
            onClick={handleAddAllergy} 
            variant="contained" 
            color="warning" 
            disabled={allergyName.trim() === ''}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddAllergyButton;