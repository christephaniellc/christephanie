import React from 'react';
import { Chip, darken, useTheme } from '@mui/material';
import { FoodAllergyIconProps } from '@/components/Allergies';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';

interface AllergyButtonProps {
  allergy: FoodAllergyIconProps;
  guestId: string;
  handleGuestFoodAllergy: (allergyName: string) => void;
}

const AllergyButton: React.FC<AllergyButtonProps> = ({
  allergy,
  guestId,
  handleGuestFoodAllergy
}) => {
  const theme = useTheme();
  const guest = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const isPending = familyActions.patchFamilyGuestMutation.status === 'pending';
  const isFetching = familyActions.getFamilyUnitQuery.isFetching;
  const isSelected = guest.preferences.foodAllergies.includes(allergy.allergyName);

  return (
    <Chip
      key={allergy.allergyName}
      sx={{
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(0,0,0,.6)',
        cursor: 'pointer',
        m: 0.5,
        transition: 'all 0.2s ease',
        border: isSelected
          ? `1px solid ${theme.palette.warning.main}`
          : `1px solid ${darken(theme.palette.grey[500], 0.2)}`,
        color: isSelected
          ? theme.palette.warning.main
          : theme.palette.text.primary,
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,.7)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        '& .MuiChip-icon': {
          color: isSelected
            ? theme.palette.warning.main
            : theme.palette.text.secondary,
          transition: 'color 0.2s ease',
        },
      }}
      variant={isSelected ? 'outlined' : ('filled' as 'outlined' | 'filled')}
      color={isSelected ? 'warning' : ('default' as 'warning' | 'default')}
      icon={<allergy.icon />}
      disabled={isPending || isFetching}
      label={allergy.allergyName}
      onClick={() => handleGuestFoodAllergy(allergy.allergyName)}
    />
  );
};

export default AllergyButton;