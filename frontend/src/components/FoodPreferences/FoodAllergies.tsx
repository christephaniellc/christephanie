import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';
import { AgeGroupEnum } from '@/types/api';
import { useFoodAllergies } from './hooks';
import { 
  AllergyButtonGroup, 
  BabyFoodInfo,
  ActiveEatingIcon
} from './components';
import AllergySelectionModal from './components/AllergySelectionModal';
import { useRecoilValue } from 'recoil';
import { guestSelector } from '@/store/family';

function FoodAllergies({ guestId }: { guestId: string }) {
  const theme = useTheme();
  const guest = useRecoilValue(guestSelector(guestId));
  const {
    allergyIconProps,
    modalOpen,
    setModalOpen,
    handleGuestFoodAllergy,
    resetAllergies,
    handleMouseMove,
    filterColorSecondary,
  } = useFoodAllergies(guestId);

  return (
    <Box
      onMouseMove={handleMouseMove}
      sx={{
        maxHeight: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        p: 1,
        m: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px dashed ${theme.palette.secondary.main}`,
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      {guest.ageGroup === AgeGroupEnum.Baby ? (
        <BabyFoodInfo guestId={guestId} />
      ) : (
        <>
          <AllergyButtonGroup
            guestId={guestId}
            chosenAllergies={guest.preferences.foodAllergies}
            activeEatingIcon={<ActiveEatingIcon guestId={guestId} filterColorSecondary={filterColorSecondary} />}
            resetAllergies={resetAllergies}
            allergyIconProps={allergyIconProps}
            setModalOpen={setModalOpen}
          />
          
          <Box component="div">
            <AllergySelectionModal
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              guestId={guestId}
              allergyIconProps={allergyIconProps}
              handleGuestFoodAllergy={handleGuestFoodAllergy}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default FoodAllergies;