import React, { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useRecoilValue } from 'recoil';
import { FoodAllergyIconProps, seriousFoodAllergies } from '@/components/Allergies';
import Button from '@mui/material/Button';
import { 
  ButtonGroup, 
  Chip, 
  darken, 
  Dialog,
  InputAdornment, 
  TextField, 
  useTheme 
} from '@mui/material';
import { guestSelector, useFamily } from '@/store/family';
import { userState } from '@/store/user';
import Vegetarian from '@/assets/Vegetarian.png';
import Vegan from '@/assets/Vegan.png';
import Omnivore from '@/assets/Omnivore.png';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import { AgeGroupEnum, FoodPreferenceEnum } from '@/types/api';
import { Inbox, LunchDining, SvgIconComponent, WarningAmber } from '@mui/icons-material';
import AddAllergyButton from '@/components/AddAllergyButton/AddAllergyButton';
import SharkIcon from '@/components/SharkIcon/SharkIcon';
import ListItem from '@mui/material/ListItem';
import BabyBottleIcon from '@/components/SharkIcon/BottleIcon';

function FoodAllergies({ guestId }: { guestId: string }) {
  const mousePosition = useRef({ x: 0, y: 0 });
  const filterColorPrimary =
    'brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7453%) hue-rotate(278deg) brightness(106%) contrast(114%);';
  const filterColorSecondary =
    'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%);';

  const theme = useTheme();
  const [allergyIconProps, setAllergyIconProps] =
    useState<FoodAllergyIconProps[]>(seriousFoodAllergies);
  const [_, familyActions] = useFamily();
  const [newAllergies, setNewAllergies] = useState(['None']);
  const guest = useRecoilValue(guestSelector(guestId));
  const loggedInUser = useRecoilValue(userState);

  useEffect(() => {
    console.log('guestAllergies', guestAllergies);
    setPageAllergies();
  }, []);

  useEffect(() => {
    if (guestAllergies && guest !== null) {
      const updatedAllergies = allergyIconProps.map((allergy) => ({
        ...allergy,
        selected: guestAllergies.includes(allergy.allergyName),
      }));
      setAllergyIconProps(updatedAllergies);
    }
  }, [guest]);

  const chosenAllergies = useMemo(() => {
    const maybeAllergies = allergyIconProps
      .filter((allergy) => allergy.selected)
      .map((allergy) => allergy.allergyName);
    return maybeAllergies.length ? maybeAllergies : ['none'];
  }, [allergyIconProps]);

  const activeEatingIcon = useMemo(() => {
    if (guest.ageGroup === AgeGroupEnum.Baby) {
      return (
        <BabyBottleIcon
          sx={{
            filter:
              'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%)',
          }}
          width={32}
          height={32}
          mr={1}
        />
      );
    }
    switch (guest.preferences.foodPreference) {
      case FoodPreferenceEnum.Vegan:
        return (
          <Box
            sx={{
              filter: guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegan)
                ? filterColorSecondary
                : '',
            }}
            component={'img'}
            src={`${Vegan}`}
            width={20}
            height={20}
            mr={1}
          />
        );
      case FoodPreferenceEnum.Vegetarian:
        return (
          <Box
            sx={{
              filter: guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegetarian)
                ? filterColorSecondary
                : '',
            }}
            component={'img'}
            src={`${Vegetarian}`}
            width={20}
            height={20}
            mr={1}
          />
        );
      case FoodPreferenceEnum.Omnivore:
        return <LunchDining />;
      case FoodPreferenceEnum.Unknown:
      default:
        return <SharkIcon />;
    }
  }, [guest, chosenAllergies]);

  const [addingAllergy, setAddingAllergy] = useState<boolean>(false);

  const guestAllergies = useMemo(() => {
    return guest?.preferences?.foodAllergies;
  }, [guest]);

  // const showSaveButton = useMemo(() => chosenAllergies.join(',') === guestAllergies?.join(',') ? 'none' : 'block', [chosenAllergies, guestAllergies]);

  const setPageAllergies = () => {
    if (guest?.preferences?.foodAllergies.length) {
      setNewAllergies(guest?.preferences?.foodAllergies);
    } else {
      setNewAllergies(['none']);
    }
  };

  useEffect(() => {
    const activeAllergies = allergyIconProps.filter((allergy) => allergy.selected);
    if (activeAllergies.length) {
      setNewAllergies(activeAllergies.map((allergy) => allergy.allergyName));
    }
    setPageAllergies();
  }, [allergyIconProps]);

  const guestName = guest?.auth0Id === loggedInUser.auth0Id ? 'You' : guest?.firstName;

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
  const resetAllergies = () => {
    const allAllergiesSelectedFalse = seriousFoodAllergies.map((allergy) => ({
      ...allergy,
      selected: false,
    }));
    familyActions.updateFamilyGuestFoodAllergies(guestId, ['none']);
    setAllergyIconProps(allAllergiesSelectedFalse);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const calculateShadow = () => {
    const { x, y } = mousePosition.current;
    const shadowX = (x / window.innerWidth) * 15 + 5;
    const shadowY = (y / window.innerHeight) * 15 + 5;
    return `${shadowX}px ${shadowY}px 0px ${darken(theme.palette.primary.main, 0.85)}`;
  };

  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Function to handle search input changes
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
  }, [filteredAllergies, guest.preferences.foodAllergies]);

  return (
    <Box
      onMouseMove={handleMouseMove}
      sx={{
        maxHeight: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        p: 1,
        m: 0,
        flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      {guest.ageGroup === AgeGroupEnum.Baby && (
        <Box sx={{ textAlign: 'center', width: '100%', p: 2 }}>
          <BabyBottleIcon 
            sx={{ 
              fontSize: 60, 
              mb: 2,
              color: theme.palette.secondary.main 
            }} 
          />
          <Typography variant="h6" color="secondary" gutterBottom>
            {guestName} is a baby.
          </Typography>
          <Typography variant="body1" color="secondary.light">
            They'll need their own special food. We'll have high chairs available, but please bring any specific baby food your little one prefers.
          </Typography>
        </Box>
      )}
      {guest.ageGroup !== AgeGroupEnum.Baby && (
        <>
          {/* Two big buttons side by side */}
          <Box display="flex" width="100%" gap={2} mb={2}>
            <Button
              color="secondary"
              variant={chosenAllergies.join('') === 'none' ? 'contained' : 'outlined'}
              sx={{
                flexGrow: 1,
                height: 80,
                lineHeight: 1.2,
                justifyContent: 'flex-start',
                paddingY: 1.5,
                paddingX: 2,
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(0,0,0,.6)',
                border: (theme) => 
                  chosenAllergies.join('') === 'none' 
                    ? `1px solid ${theme.palette.secondary.main}` 
                    : `1px solid ${darken(theme.palette.grey[500], 0.2)}`,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,.7)',
                  backdropFilter: 'blur(20px)',
                },
                transition: 'all 0.2s ease',
              }}
              startIcon={activeEatingIcon}
              onClick={() => resetAllergies()}
              disabled={
                familyActions.patchFamilyGuestMutation.status === 'pending' ||
                familyActions.getFamilyUnitQuery.isFetching
              }
            >
              I can eat anything
            </Button>
            
            <Button
              variant={chosenAllergies.join('') !== 'none' ? 'contained' : 'outlined'}
              color="warning"
              sx={{
                flexGrow: 1,
                height: 80,
                lineHeight: 1.2,
                justifyContent: 'flex-start',
                paddingY: 1.5,
                paddingX: 2,
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(0,0,0,.6)',
                border: (theme) => 
                  chosenAllergies.join('') !== 'none' 
                    ? `1px solid ${theme.palette.warning.main}` 
                    : `1px solid ${darken(theme.palette.grey[500], 0.2)}`,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,.7)',
                  backdropFilter: 'blur(20px)',
                },
                transition: 'all 0.2s ease',
              }}
              startIcon={<WarningAmber />}
              onClick={() => setModalOpen(true)}
              disabled={
                familyActions.patchFamilyGuestMutation.status === 'pending' ||
                familyActions.getFamilyUnitQuery.isFetching
              }
            >
              {chosenAllergies.join('') === 'none' ? 'I\'m allergic to stuff' : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-start' }}>
                  {chosenAllergies.map(allergy => {
                    if (allergy === 'none') return null;
                    const allergyData = allergyIconProps.find(a => a.allergyName === allergy);
                    if (!allergyData) return null;
                    return (
                      <Chip 
                        key={allergy}
                        label={allergy}
                        size="small"
                        icon={allergyData ? <allergyData.icon fontSize="small" /> : undefined}
                        sx={{ 
                          m: 0.25,
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          backdropFilter: 'blur(5px)',
                          border: `1px solid ${theme.palette.warning.light}`,
                          color: theme.palette.warning.light,
                          transition: 'all 0.2s ease',
                          '& .MuiChip-icon': {
                            color: theme.palette.warning.light,
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Button>
          </Box>
          
          {/* Allergies selection modal */}
          <Box component="div">
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
                    <Chip
                      key={allergy.allergyName}
                      sx={{
                        backdropFilter: 'blur(20px)',
                        backgroundColor: 'rgba(0,0,0,.6)',
                        cursor: 'pointer',
                        m: 0.5,
                        transition: 'all 0.2s ease',
                        border: guest.preferences.foodAllergies.includes(allergy.allergyName)
                          ? `1px solid ${theme.palette.warning.main}`
                          : `1px solid ${darken(theme.palette.grey[500], 0.2)}`,
                        color: guest.preferences.foodAllergies.includes(allergy.allergyName)
                          ? theme.palette.warning.main
                          : theme.palette.text.primary,
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,.7)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        },
                        '& .MuiChip-icon': {
                          color: guest.preferences.foodAllergies.includes(allergy.allergyName)
                            ? theme.palette.warning.main
                            : theme.palette.text.secondary,
                          transition: 'color 0.2s ease',
                        },
                      }}
                      variant={
                        guest.preferences.foodAllergies.includes(allergy.allergyName)
                          ? 'outlined'
                          : ('filled' as 'outlined' | 'filled')
                      }
                      color={
                        guest.preferences.foodAllergies.includes(allergy.allergyName)
                          ? 'warning'
                          : ('default' as 'warning' | 'default')
                      }
                      icon={<allergy.icon />}
                      disabled={
                        familyActions.patchFamilyGuestMutation.status === 'pending' ||
                        familyActions.getFamilyUnitQuery.isFetching
                      }
                      label={allergy.allergyName}
                      onClick={() => handleGuestFoodAllergy(allergy.allergyName)}
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
                <AddAllergyButton 
                  guestId={guestId} 
                />
              </Box>
            </Dialog>
          </Box>
        </>
      )}
    </Box>
  );
}

export default FoodAllergies;
