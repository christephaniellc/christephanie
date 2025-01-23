import React, { useEffect, useMemo, useState } from 'react';
import { Box, Tabs, Tab, Typography, LinearProgress, Button, linearProgressClasses } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useRecoilValue } from 'recoil';
import { useLocation, useNavigate } from 'react-router-dom';

import { familyGuestsStates, useFamily } from '@/store/family';
import { GuestDto } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import AddressEnvelope from '@/components/AddressEnvelope/AddressEnvelope';
import { ButtonsContainer } from '@/pages/SaveTheDate/SaveTheDatePage';
import IconButton from '@mui/material/IconButton';
import { CloseTwoTone } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

export default function SaveTheDateTabs() {
  const familyStates = useRecoilValue(familyGuestsStates);
  const [family, familyActions] = useFamily();
  const navigate = useNavigate();
  const location = useLocation();
  // Local state to track which "tab" (formerly "step") is active
  const [tabIndex, setTabIndex] = React.useState(0);
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    if (urlParams?.get('step') === 'attendance') {
      setTabIndex(0);
    } else if (urlParams?.get('step') === 'address') {
      setTabIndex(1);
    }
  }, [urlParams]);

  useEffect(() => {
    setUrlParams(new URLSearchParams(location.search));
  }, [location]);

  // For a determinate progress bar, you can base the percentage on
  // which tab is active vs. the total number of tabs.
  // Example: if we have 2 steps, step 0 = 0%, step 1 = 50%, step 2 (if we had 3 steps) = 100%, etc.
  const steps = useMemo(() => {
    if (!familyStates) return [];
    const { guests, callByLastNames, attendingLastNames, nobodyComing } = familyStates;
    return [
      {
        label: 'Who’s Interested?',
        description: '',
        component: (
          <Box textAlign="center">
            {guests && !!guests.length && (
              <>
                {!nobodyComing && (
                  <Typography sx={{ mb: 2 }}>
                    {guests.length === 1 ? 'I' : 'We'} are excited to celebrate with you, {attendingLastNames}!
                  </Typography>
                )}
                {nobodyComing && (
                  <Typography sx={{ mb: 2 }}>
                    {guests.length === 1 ? 'I' : 'We'} hope you can make it, {callByLastNames}!
                  </Typography>
                )}
                <ButtonsContainer>
                  {guests.map((guest: GuestDto) => (
                    <AttendanceButton guestId={guest.guestId!} key={guest.guestId} />
                  ))}
                </ButtonsContainer>
              </>
            )}
          </Box>
        ),
      },
      {
        label: 'Where should we send your invitation?',
        description:
          'Finalize your save-the-date by providing and validating your mailing address.',
        component: (
          <AddressEnvelope />
        ),
      },
      {
        label: 'A third step!',
        description: 'This is a third step.',
        component: <Typography>Step 3</Typography>,
      }
    ];
  }, [familyStates]);

  // This determines how many tabs there are
  const totalTabs = steps.length;

  // Convert current tab index to a 0–100 percentage
  const progressValue = totalTabs > 1 ? (tabIndex / (totalTabs - 1)) * 100 : 0;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // If you still want a "next" button that runs logic, you can keep your existing logic:
  const handleNext = () => {
    // Example logic from your original code
    if (!familyStates?.allUsersResponded) {
      navigate('/save-the-date?step=attendance');
    } else if (!familyStates?.mailingAddressEntered || !familyStates?.mailingAddressUspsVerified) {
      navigate('/save-the-date?step=address');
    } else if (familyStates.nobodyComing) {
      console.log('find a way to disable this button');
    } else {
      // Go to the next tab if possible
      setTabIndex((prev) => Math.min(prev + 1, totalTabs - 1));
    }
  };

  const handleBack = () => {
    setTabIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      <Box display={'flex'} justifyContent="flex-end" mb={2} pr={4} width="100%">
        <IconButton onClick={() => navigate('/')}>
          <CloseTwoTone />
        </IconButton>
      </Box>
      {/* Linear Progress across top */}
      <Box width="100%" px={4}>
        <BorderLinearProgress
          variant="determinate"
          value={progressValue}
          sx={{ width: '100%', mb: 2 }}
        />
      </Box>

      {/* Tabs, centered */}
      <Box maxWidth={600} mx="auto">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          centered
          // If you want each tab to stretch across the container, use variant="fullWidth"
          // variant="fullWidth"
        >
          {steps.map((step, index) => (
            <Tab key={index} label={step.label} />
          ))}
        </Tabs>

        {/* Display the content for the currently selected tab */}
        <Box sx={{ p: 2 }}>
          {tabIndex < totalTabs && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {steps[tabIndex].description}
              </Typography>
              {steps[tabIndex].component}
            </>
          )}

          {/* Optional: Next / Back Buttons */}
          <Box sx={{ mt: 20, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleBack} disabled={tabIndex <= 0}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={tabIndex >= totalTabs - 1}>
              Next
            </Button>
          </Box>
        </Box>

        {/* If you want a "finished" state after the last tab, you can conditionally render it:
          {tabIndex === totalTabs && (
            <Paper square elevation={0} sx={{ p: 3 }}>
              <Typography>All steps completed - you’re finished</Typography>
              <Button onClick={() => setTabIndex(0)} sx={{ mt: 1, mr: 1 }}>
                Reset
              </Button>
            </Paper>
          )}
      */}
      </Box>
    </Box>
  );
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 0,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main,
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.primary.dark,
    }),
  },
}));