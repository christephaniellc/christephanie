import React, { useState } from 'react';
import { Box, Button, Checkbox, TextField } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';

const AddAllergyButton = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [allergyText, setAllergyText] = useState('Add Allergy');
  const [inputValue, setInputValue] = useState('');

  const handleButtonClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleCheckboxClick = () => {
    setAllergyText(inputValue);
    setIsEditing(false);
  };

  return (
    <Box display="flex" alignItems="center">
      {isEditing ? (
        <Box display="flex" alignItems="center">
          <TextField
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type allergy"
            variant="outlined"
            size="small"
          />
          <Checkbox onClick={handleCheckboxClick} />
        </Box>
      ) : (
        <Button onClick={handleButtonClick} variant="contained" startIcon={<WarningAmber />}>
          {allergyText}
        </Button>
      )}
    </Box>
  );
};

export default AddAllergyButton;