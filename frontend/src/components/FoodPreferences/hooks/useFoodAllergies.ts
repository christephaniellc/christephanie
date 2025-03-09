import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FoodAllergyIconProps, seriousFoodAllergies } from '@/components/Allergies';
import { guestSelector, useFamily } from '@/store/family';
import { darken, useTheme } from '@mui/material';

// This hook is now simplified as most of the state management 
// is directly handled by the individual components
export const useFoodAllergies = (guestId: string) => {
  const theme = useTheme();
  const mousePosition = useRef({ x: 0, y: 0 });
  const [allergyIconProps, setAllergyIconProps] = useState<FoodAllergyIconProps[]>(seriousFoodAllergies);
  const [modalOpen, setModalOpen] = useState(false);
  const [_, familyActions] = useFamily();
  const guest = useRecoilValue(guestSelector(guestId));
  
  const filterColorPrimary = 'brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7453%) hue-rotate(278deg) brightness(106%) contrast(114%);';
  const filterColorSecondary = 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%);';
  
  const handleMouseMove = (event: React.MouseEvent) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const calculateShadow = () => {
    const { x, y } = mousePosition.current;
    const shadowX = (x / window.innerWidth) * 15 + 5;
    const shadowY = (y / window.innerHeight) * 15 + 5;
    return `${shadowX}px ${shadowY}px 0px ${darken(theme.palette.primary.main, 0.85)}`;
  };
  
  const resetAllergies = () => {
    const allAllergiesSelectedFalse = seriousFoodAllergies.map((allergy) => ({
      ...allergy,
      selected: false,
    }));
    familyActions.updateFamilyGuestFoodAllergies(guestId, ['none']);
    setAllergyIconProps(allAllergiesSelectedFalse);
  };
  
  const handleGuestFoodAllergy = (allergyName: string) => {
    const updatedAllergies = allergyIconProps.map((allergy) => {
      if (allergy.allergyName === allergyName) {
        return { ...allergy, selected: !allergy.selected };
      }
      return allergy;
    });
    const maybeAllergies = updatedAllergies
      .filter((allergy) => allergy.selected)
      .map((allergy) => allergy.allergyName);
    familyActions.updateFamilyGuestFoodAllergies(
      guestId,
      maybeAllergies.length ? maybeAllergies : ['none'],
    );
    setAllergyIconProps(updatedAllergies);
  };

  return {
    guest,
    allergyIconProps,
    modalOpen,
    setModalOpen,
    handleGuestFoodAllergy,
    resetAllergies,
    handleMouseMove,
    calculateShadow,
    filterColorPrimary,
    filterColorSecondary,
  };
};

export default useFoodAllergies;