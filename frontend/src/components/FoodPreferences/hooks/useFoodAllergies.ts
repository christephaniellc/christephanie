import { useRef, useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { 
  FoodAllergyIconProps, 
  seriousFoodAllergies, 
  getIconForCustomAllergy 
} from '@/components/Allergies';
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
  
  // Find custom allergies that aren't in the predefined list
  const customAllergies = useMemo(() => {
    if (!guest?.preferences?.foodAllergies || guest?.preferences?.foodAllergies.length === 0) return [];
    
    // Find allergies that are not in the standard list
    return guest.preferences.foodAllergies.filter(allergyName => 
      allergyName !== 'none' && 
      !seriousFoodAllergies.some(a => a.allergyName === allergyName)
    );
  }, [guest?.preferences?.foodAllergies]);
  
  // Merge custom allergies with the standard list
  useEffect(() => {
    if (customAllergies.length === 0) {
      // If no custom allergies, just use the standard list with selection state
      const updatedAllergies = seriousFoodAllergies.map(allergy => ({
        ...allergy,
        selected: guest?.preferences?.foodAllergies?.includes(allergy.allergyName) || false
      }));
      setAllergyIconProps(updatedAllergies);
      return;
    }
    
    // If there are custom allergies, add them to the list
    const customAllergyProps: FoodAllergyIconProps[] = customAllergies.map(allergyName => ({
      allergyName,
      icon: getIconForCustomAllergy(allergyName),
      selected: true // Custom allergies are always selected since they came from the user's data
    }));
    
    // Update standard allergies' selection state
    const updatedStandardAllergies = seriousFoodAllergies.map(allergy => ({
      ...allergy,
      selected: guest?.preferences?.foodAllergies?.includes(allergy.allergyName) || false
    }));
    
    // Combine both lists and set state
    setAllergyIconProps([...customAllergyProps, ...updatedStandardAllergies]);
  }, [customAllergies, guest?.preferences?.foodAllergies]);
  
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
    const allAllergiesSelectedFalse = allergyIconProps.map((allergy) => ({
      ...allergy,
      selected: false,
    }));
    familyActions.updateFamilyGuestFoodAllergies(guestId, ['none']);
    setAllergyIconProps(allAllergiesSelectedFalse);
  };
  
  const handleGuestFoodAllergy = (allergyName: string) => {
    // Check if the allergy already exists in the allergyIconProps
    const allergyExists = allergyIconProps.some(a => a.allergyName === allergyName);
    
    let updatedAllergies;
    
    if (allergyExists) {
      // Toggle the selection state of an existing allergy
      updatedAllergies = allergyIconProps.map((allergy) => {
        if (allergy.allergyName === allergyName) {
          return { ...allergy, selected: !allergy.selected };
        }
        return allergy;
      });
    } else {
      // This is a new custom allergy, add it to the list as selected
      updatedAllergies = [
        {
          allergyName,
          icon: getIconForCustomAllergy(allergyName),
          selected: true
        },
        ...allergyIconProps
      ];
    }
    
    const maybeAllergies = updatedAllergies
      .filter((allergy) => allergy.selected)
      .map((allergy) => allergy.allergyName);
    
    familyActions.updateFamilyGuestFoodAllergies(
      guestId,
      maybeAllergies && maybeAllergies.length ? maybeAllergies : ['none'],
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
    customAllergies
  };
};

export default useFoodAllergies;