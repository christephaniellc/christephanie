# RSVP Page Improvements Plan

## Current Status (As of 04/15/2025)

The RSVP page implementation is currently in progress with the following key observations:

1. **Component Structure:**
   - The MainRSVPContent component maps step names to different section components
   - The current `weddingAttendance` step is mapped to the `WelcomeSection` component
   - The buttons in the WelcomeSection need styling improvement to match the FourthOfJulyButton component styling
   - No dedicated "welcome" step appears to exist anymore

2. **State Management:**
   - RSVP-specific state is managed in `src/store/steppers/rsvpStepper.ts`
   - Step definitions need to be updated to reflect the current implementation

3. **Navigation:**
   - RSVPStepper component handles navigation and step visibility
   - Step visibility is conditionally determined based on attendance status

## Proposed Improvements

### 1. Update Step Structure in rsvpStepper.ts

Current steps structure should be updated to properly reflect the actual implementation:

```typescript
// Current structure needs updating
export const rsvpStepsState = atom<Record<string, RsvpStep>>({
  key: 'rsvpStepper',
  default: {
    weddingAttendance: {
      id: 0,
      completed: true,
      label: 'Will you be attending our wedding?',
      description: 'Please confirm your final attendance',
      component: null,
      display: true,
    },
    fourthOfJulyAttendance: {
      id: 1,
      completed: false,
      label: 'Rehearsal Dinner Attendance',
      description: 'For invited guests only',
      component: null,
      display: true,
    },
    // Other steps...
  },
});
```

The proposed updated steps would be:

```typescript
export const rsvpStepsState = atom<Record<string, RsvpStep>>({
  key: 'rsvpStepper',
  default: {
    weddingAttendance: {
      id: 0,
      completed: true,
      label: 'Wedding Attendance',
      description: 'Confirm your attendance',
      component: null,
      display: true,
    },
    fourthOfJulyAttendance: {
      id: 1,
      completed: false,
      label: 'Rehearsal Dinner',
      description: 'For invited guests only',
      component: null,
      display: true, // This could be conditionally set based on guest status
    },
    foodPreferences: {
      id: 2,
      completed: false,
      label: 'Food Preferences',
      description: 'Dietary needs and restrictions',
      component: null,
      display: true,
    },
    // Other steps with accurate naming and order...
  },
});
```

### 2. Improve Button Styling in Attendance Sections

The existing WelcomeSection (for wedding attendance) and others should be updated to use consistent button styling similar to FourthOfJulyButton:

- Use the styled component approach in FourthOfJulyButton
- Apply the same visual treatments (icons, text shadow, hover effects)
- Use consistent colors and styling across all sections
- Ensure responsive behavior for mobile and desktop

### 3. Consistent Visual Design Across All RSVP Sections

All sections should have:
- Consistent card styling with proper margins and padding
- Standardized typography and color schemes
- Consistent button layouts and behaviors
- Responsive layouts that work well on all devices
- Proper feedback messages for all actions

### 4. Documentation Updates

The following docs should be updated to reflect the current implementation:
- Update `RSVP.md` to reflect current progress
- Update `RSVP-Phase1-State-Management.md` with correct step structure
- Deprecate or update `RSVP-Wedding-Attendance-Prefilling.md` since slider is no longer being used

## Implementation Tasks

1. **State Management Update:**
   - [ ] Update rsvpStepsState with correct step structure
   - [ ] Ensure step IDs are sequential and match their position in the flow
   - [ ] Review step visibility logic in RSVPStepper

2. **Visual Improvements:**
   - [ ] Create consistent button styling for WelcomeSection (weddingAttendance)
   - [ ] Update FoodPreferencesSection, TransportationSection, and AccommodationSection with consistent styling
   - [ ] Improve SummarySection to display all collected information clearly

3. **Navigation Enhancements:**
   - [ ] Ensure proper step progress tracking
   - [ ] Add clear back/forward navigation buttons
   - [ ] Improve feedback when steps are completed

4. **Documentation:**
   - [ ] Update documentation to reflect current architecture and component relationships
   - [ ] Document step dependencies (which steps should be shown based on attendance)
   - [ ] Create visual mockups or diagrams showing the RSVP flow

## Next Steps

1. Discuss with team which improvements should be prioritized
2. Create specific tasks for each improvement area
3. Implement improvements incrementally, starting with state management
4. Test and validate each change in development environment