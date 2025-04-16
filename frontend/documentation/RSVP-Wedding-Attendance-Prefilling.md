# RSVP Page - Phase 3.1: Wedding Attendance Slider Implementation

This document outlines the implementation details for creating a slider-based wedding attendance confirmation component that requires explicit confirmation of attendance status.

## Current Implementation Status

The WeddingAttendanceSlider component is not yet implemented. The codebase currently has:

1. **WeddingAttendanceRadios component**: A vertical slider with 3 states (Declined, Undecided, Interested). This existing component doesn't include the final "Attending" state, which is why we need the new horizontal slider.

2. **StickFigureIcon component**: A fully implemented component that randomly selects one of many icon variations based on age group (Baby, Under13, Under21, Adult). This component supports rotations and has the visual elements needed for our slider thumb.

3. **Relevant Types/Enums**:
   - InvitationResponseEnum (Pending, Interested, Declined)
   - RsvpEnum (Pending, Attending, Declined)
   - AgeGroupEnum (Baby, Under13, Under21, Adult)

4. **State Management**: The app uses Recoil for state management, with relevant selectors and actions via useFamily() hook.

## Implementation Plan

Rather than automatically converting "Interested" to "Attending," we want users to take an explicit action to confirm their final RSVP status. We'll implement a horizontal slider component with discrete steps representing different attendance statuses.

## Slider Design

### Appearance and Interaction
- Horizontal slider with 4 discrete steps: Pending, Declined, Interested, Attending
- Each step represented by a StickFigureIcon with 0-degree rotation and appropriate age for the user
- Pre-set to user's current status (from InvitationResponseEnum and RsvpEnum)
- Clear visual differentiation between steps
- User must physically drag or click to move the slider to "Attending" to confirm attendance

### Visual Elements
- Custom slider track with distinct sections for each status
- Custom thumb using StickFigureIcon that represents the user's age group
- Clear labels for each position
- Color coding: Neutral/blue for Pending, Red for Declined, Yellow/Orange for Interested, Green for Attending
- Visual feedback when slider position changes

## Component Requirements

### WeddingAttendanceSlider Component

This component will:

1. Display the guest's name above the slider
2. Show a horizontal slider with 4 discrete positions
3. Use StickFigureIcon as the thumb component
4. Pre-set the slider to the user's current status
5. Include clear labels for each slider position
6. Provide visual feedback when the slider position changes
7. Update the database when the slider position changes (after a brief delay)

## Data Mapping

The slider will map between different status enums:

| Slider Position | InvitationResponseEnum | RsvpEnum    |
|----------------|-------------------------|-------------|
| 0              | Pending                 | Pending     |
| 1              | Declined                | Declined    |
| 2              | Interested              | Pending     |
| 3              | Interested              | Attending   |

Notes:
- Position 2 (Interested) means they're interested but haven't formally RSVP'd
- Position 3 (Attending) means they're formally confirmed attendance

## Initial Position Logic

When determining the initial slider position:

1. If wedding RSVP is Attending: Position 3 (Attending)
2. If invitation response is Interested and wedding RSVP is not set: Position 2 (Interested)
3. If invitation response is Declined: Position 1 (Declined)
4. Otherwise: Position 0 (Pending)

## Data Flow

1. On component mount, check the guest's current status from both `invitationResponse` and wedding `rsvp` data
2. Set the initial slider position based on the logic above
3. When the user moves the slider:
   - Update local state immediately for responsive UI
   - After a brief delay (to avoid rapid updates), update the database with new status values
   - Update both wedding RSVP status and invitationResponse if needed
4. Refresh the family data to ensure UI is up to date

## Implementation Steps

1. Create the WeddingAttendanceSlider component file structure:
   ```
   /components/WeddingAttendanceSlider/
     ├── WeddingAttendanceSlider.tsx
     ├── index.ts
     └── (optional test files)
   ```

2. Implement a custom Material UI Slider with discrete steps and custom styling

3. Create a custom thumb component using StickFigureIcon and appropriate age group

4. Implement event handlers for slider changes with debounced updates to the database

5. Add appropriate styling for different slider positions

## Code Snippet Example

Basic structure for the component might look like:

```tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Slider, Typography, styled } from '@mui/material';
import { useFamily, guestSelector } from '@/store/family';
import { useRecoilValue } from 'recoil';
import { InvitationResponseEnum, RsvpEnum, AgeGroupEnum } from '@/types/api';
import StickFigureIcon from '@/components/StickFigureIcon';
import debounce from 'lodash/debounce';

// Custom thumb component using StickFigureIcon
function SliderThumb(props) {
  const { children, ageGroup, ...other } = props;
  return (
    <Box component="span" {...other}>
      <StickFigureIcon fontSize="large" ageGroup={ageGroup} rotation={0} />
      {children}
    </Box>
  );
}

// Custom styled slider
const AttendanceSlider = styled(Slider)(({ theme }) => ({
  height: 8,
  '& .MuiSlider-track': {
    background: `linear-gradient(to right, 
      ${theme.palette.info.main} 0%, 
      ${theme.palette.info.main} 25%, 
      ${theme.palette.error.main} 25%, 
      ${theme.palette.error.main} 50%, 
      ${theme.palette.warning.main} 50%, 
      ${theme.palette.warning.main} 75%, 
      ${theme.palette.success.main} 75%, 
      ${theme.palette.success.main} 100%)`
  },
  '& .MuiSlider-thumb': {
    width: 48,
    height: 48,
    marginTop: -20,
    marginLeft: -24,
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'none',
    }
  },
  '& .MuiSlider-mark': {
    backgroundColor: '#bfbfbf',
    height: 8,
    width: 1,
    marginTop: 0,
  },
  '& .MuiSlider-markActive': {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
}));

interface WeddingAttendanceSliderProps {
  guestId: string;
}

const WeddingAttendanceSlider: React.FC<WeddingAttendanceSliderProps> = ({ guestId }) => {
  const [, familyActions] = useFamily();
  const guest = useRecoilValue(guestSelector(guestId));
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Determine initial slider position
  const getInitialSliderPosition = () => {
    // Position 3: Formally attending
    if (guest?.rsvp?.wedding === RsvpEnum.Attending) {
      return 3;
    }
    
    // Position 2: Interested but not formally RSVP'd
    if (guest?.rsvp?.invitationResponse === InvitationResponseEnum.Interested && 
        (!guest?.rsvp?.wedding || guest.rsvp.wedding === RsvpEnum.Pending)) {
      return 2;
    }
    
    // Position 1: Declined
    if (guest?.rsvp?.invitationResponse === InvitationResponseEnum.Declined ||
        guest?.rsvp?.wedding === RsvpEnum.Declined) {
      return 1;
    }
    
    // Position 0: Pending (default)
    return 0;
  };

  const [sliderPosition, setSliderPosition] = useState<number>(0);

  useEffect(() => {
    if (guest) {
      setSliderPosition(getInitialSliderPosition());
    }
  }, [guest]);

  // Labels for the slider positions
  const marks = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Declined' },
    { value: 2, label: 'Interested' },
    { value: 3, label: 'Attending' },
  ];

  // Update database with debounce to avoid rapid updates
  const updateStatusInDatabase = useMemo(
    () => debounce(async (position: number) => {
      if (!guest) return;
      
      setIsUpdating(true);
      try {
        // Map slider position to invitation response and wedding RSVP
        let invitationResponse = InvitationResponseEnum.Pending;
        let weddingRsvp = RsvpEnum.Pending;
        
        switch (position) {
          case 1: // Declined
            invitationResponse = InvitationResponseEnum.Declined;
            weddingRsvp = RsvpEnum.Declined;
            break;
          case 2: // Interested
            invitationResponse = InvitationResponseEnum.Interested;
            weddingRsvp = RsvpEnum.Pending;
            break;
          case 3: // Attending
            invitationResponse = InvitationResponseEnum.Interested;
            weddingRsvp = RsvpEnum.Attending;
            break;
          default: // Pending (0)
            invitationResponse = InvitationResponseEnum.Pending;
            weddingRsvp = RsvpEnum.Pending;
        }
        
        // Update both invitation response and wedding RSVP
        await familyActions.patchFamilyGuestMutation.mutate({
          updatedGuest: {
            guestId,
            invitationResponse,
            wedding: weddingRsvp,
          },
        });
        
        await familyActions.getFamily();
      } catch (error) {
        console.error('Error updating attendance status', error);
      } finally {
        setIsUpdating(false);
      }
    }, 500),
    [guest, guestId, familyActions]
  );

  // Handle slider change
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const position = newValue as number;
    setSliderPosition(position);
    updateStatusInDatabase(position);
  };

  if (!guest) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h6" gutterBottom align="center">
        {guest.firstName}'s Wedding Attendance
      </Typography>
      
      <Box sx={{ px: 5, py: 4 }}>
        <AttendanceSlider
          value={sliderPosition}
          step={1}
          min={0}
          max={3}
          marks={marks}
          onChange={handleSliderChange}
          disabled={isUpdating}
          slots={{
            thumb: (props) => <SliderThumb {...props} ageGroup={guest.ageGroup || AgeGroupEnum.Adult} />
          }}
        />
      </Box>
      
      <Typography variant="body2" align="center" color="text.secondary">
        {sliderPosition === 0 && "We haven't heard if you're coming yet. Please let us know!"}
        {sliderPosition === 1 && "You've declined the invitation. Drag the slider if your plans change."}
        {sliderPosition === 2 && "You're interested in attending. Drag to 'Attending' to confirm!"}
        {sliderPosition === 3 && "You're confirmed as attending. We're excited to see you!"}
      </Typography>
    </Box>
  );
};

export default WeddingAttendanceSlider;
```

## Visual Details

Below is a conceptual description of the slider appearance:

- **Track**: Gradient-colored background with four distinct sections
  - Pending section: Blue/gray
  - Declined section: Red
  - Interested section: Yellow/orange
  - Attending section: Green

- **Thumb**: StickFigureIcon representing the guest's age group
  - Moves along the track as the user drags
  - Provides visual indication of current status

- **Marks**: Clear text labels below each position
  - "Pending"
  - "Declined"
  - "Interested"
  - "Attending"

## Accessibility Considerations

- Ensure slider is keyboard accessible
- Add ARIA labels and descriptions
- Provide adequate color contrast
- Include text descriptions below the slider
- Support screen readers with appropriate announcements when status changes

## Testing Considerations

- Test with guests in all four possible initial positions
- Verify that the slider correctly updates both invitation response and wedding RSVP
- Test keyboard navigation
- Ensure visual feedback is clear
- Verify database updates work correctly
- Test in different viewports to ensure responsive design