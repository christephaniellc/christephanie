import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useFamily } from '@/store/family';
import React, { useEffect } from 'react';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import SaveTheDateStepper from '@/components/VerticalStepper/SaveTheDateStepper';

function SaveTheDatePage() {
  // const { matchingUsers, allLastNames, lastNames, nobodyComing } = useInvitation();
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();
  const { getFamilyUnitQuery } = familyActions;

  useEffect(() => {
    if (!getFamilyUnitQuery.isPending) {
      familyActions.getFamily();
      // return <FullSizeCenteredFlexBox>Loading...</FullSizeCenteredFlexBox>
    }

    // if (getFamilyUnitQuery.isError) {
    //   return <FullSizeCenteredFlexBox>There was an error loading your family</FullSizeCenteredFlexBox>
    // }
  }, []);



  return (
    <Box display="flex" flexDirection="column" justifyContent="" pb={10} border={'0px dashed yellow'} pt={2}>
      {(!family?.guests || !family?.guests.length) && <div onClick={() => familyActions.getFamily()}>No guests found</div>}
      <SaveTheDateStepper />
      <Box position='absolute' bottom={0} left={0} right={0} sx={{
        backgroundImage: `url(${ElPulpo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        height: 400,
        zIndex: -1,
      }}>
      </Box>
    </Box>
  );
}

export default SaveTheDatePage;

export const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'space-between',
  gap: 16,
  justifyContent: 'space-between',
  width: '100%',
  mx: 'auto',
}));