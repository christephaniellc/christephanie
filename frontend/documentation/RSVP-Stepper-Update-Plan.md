# RSVP Stepper Update Plan

## Current State Analysis

The RSVP page stepper implementation currently has the following issues:

1. **Step Structure Mismatch:**
   - The step definitions in `rsvpStepper.ts` do not fully align with the components being rendered
   - The naming isn't consistent between step keys and actual content
   - Some steps may be incorrectly ordered or missing

2. **Conditional Visibility Logic:**
   - The `RSVPStepper` component has complex logic for determining which steps should be visible
   - Visibility should be based on the family's attendance status
   - This logic needs to be reviewed and simplified

3. **Step Content Mapping:**
   - The `MainRSVPContent` component maps step IDs to different section components
   - This mapping needs to be updated to reflect the correct component for each step

## Step Structure Update

### Current Structure in `rsvpStepper.ts`

```typescript
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
    foodPreferences: {
      id: 2,
      completed: false,
      label: 'Confirm Food Preferences',
      description: 'Review and update your meal choices',
      component: null,
      display: true,
    },
    transportation: {
      id: 3,
      completed: false,
      label: 'Transportation Needs',
      description: 'Let us know if you need transportation assistance',
      component: null,
      display: true,
    },
    accommodation: {
      id: 4,
      completed: false,
      label: 'Accommodation Plans',
      description: 'Confirm your accommodation arrangements',
      component: null,
      display: true,
    },
    comments: {
      id: 5,
      completed: false,
      label: 'Additional Comments',
      description: 'Any last questions or requests?',
      component: null,
      display: true,
    },
    summary: {
      id: 6,
      completed: true,
      label: 'RSVP Summary',
      description: 'Review your RSVP information',
      component: null,
      display: true,
    },
  },
});
```

### Proposed Updated Structure

Based on the components observed in the `MainRSVPContent` and their mapping to step keys, the updated structure should be:

```typescript
export const rsvpStepsState = atom<Record<string, RsvpStep>>({
  key: 'rsvpStepper',
  default: {
    weddingAttendance: {
      id: 0,
      completed: false,
      label: 'Wedding Attendance',
      description: 'Confirm your attendance',
      component: null,
      display: true,
    },
    rehearsalDinner: { // Renamed from fourthOfJulyAttendance for clarity
      id: 1,
      completed: false,
      label: 'Rehearsal Dinner',
      description: 'For invited guests only',
      component: null,
      display: (family) => family?.atLeastOneAttending === true, // Only show if someone is attending
    },
    foodPreferences: {
      id: 2,
      completed: false,
      label: 'Meal Preferences',
      description: 'Dietary needs and preferences',
      component: null,
      display: (family) => family?.atLeastOneAttending === true,
    },
    transportation: {
      id: 3,
      completed: false,
      label: 'Transportation',
      description: 'Travel arrangements',
      component: null,
      display: (family) => family?.atLeastOneAttending === true,
    },
    accommodation: {
      id: 4,
      completed: false,
      label: 'Accommodations',
      description: 'Where you'll be staying',
      component: null,
      display: (family) => family?.atLeastOneAttending === true,
    },
    comments: {
      id: 5,
      completed: false,
      label: 'Comments',
      description: 'Additional information',
      component: null,
      display: true, // Show to everyone
    },
    summary: {
      id: 6,
      completed: false,
      label: 'Summary',
      description: 'Review your responses',
      component: null,
      display: true, // Show to everyone
    },
  },
});
```

## Component Mapping Update

The `MainRSVPContent` component needs to map step keys to their corresponding section components correctly:

```typescript
const FamilyQueryQuestion = useMemo(() => {
  switch (rsvpStepper.currentStep[0]) {
    case 'weddingAttendance':
      return <AttendanceSection />; // Updated from WelcomeSection
    case 'rehearsalDinner': // Updated name from fourthOfJulyAttendance
      return <RehearsalDinnerSection />;
    case 'foodPreferences':
      return <FoodPreferencesSection />;
    case 'transportation':
      return <TransportationSection />;
    case 'accommodation':
      return <AccommodationSection />;
    case 'comments':
      return <CommentsSection />;
    case 'summary':
      return <SummarySection />;
    default:
      return <></>;
  }
}, [rsvpStepper.currentStep, family]);
```

## Stepper Navigation Logic

The `RSVPStepper` component has complex logic for determining which steps are visible and handling navigation:

1. **Visibility Logic Update:**
   - Simplify the visibility determination based on the family's attendance status
   - Use a more declarative approach with functions in the step definitions

2. **Navigation Logic Update:**
   - Ensure the URL parameter correctly tracks the current step
   - Handle edge cases when navigating to steps that shouldn't be visible
   - Update the tab index properly when steps are skipped

```typescript
// Improved logic for computing visible steps
const visibleSteps = useMemo(() => {
  if (!familyState) return Object.entries(rsvpSteps);
  
  // Filter steps based on the display property, which could be a boolean or a function
  return Object.entries(rsvpSteps).filter(([_, step]) => {
    if (typeof step.display === 'function') {
      return step.display(familyState);
    }
    return step.display === true;
  });
}, [rsvpSteps, familyState]);
```

## Styling Improvements

Update the stepper styling for better visibility and user experience:

1. **Stepper Icons:**
   - Make active step more prominent
   - Use icons that reflect the purpose of each step
   - Ensure proper color contrast

2. **Step Labels:**
   - Make labels more descriptive but concise
   - Show labels on wider screens, hide on mobile
   - Add tooltips for more context

3. **Progress Indication:**
   - Add visual progress bar
   - Clearly indicate completed vs. pending steps
   - Use consistent colors with the rest of the UI

## Implementation Steps

1. **Update rsvpStepper.ts:**
   - Rename step keys to match their corresponding components
   - Update step labels and descriptions for clarity
   - Implement functional display properties for conditional steps

2. **Update RSVPStepper.tsx:**
   - Simplify visibility logic using the updated step definitions
   - Improve navigation handling for conditional steps
   - Enhance the UI to clearly indicate progress

3. **Update MainRSVPContent.tsx:**
   - Ensure step keys match the updated definitions
   - Update component imports if needed
   - Map steps to the appropriate section components

4. **Test All Scenarios:**
   - Test with a family where all members are attending
   - Test with a family where some members are attending and some are not
   - Test with a family where no members are attending
   - Verify navigation between steps works correctly in all scenarios

## Accessibility Considerations

1. **Keyboard Navigation:**
   - Ensure the stepper can be navigated with the keyboard
   - Add proper focus management
   - Use ARIA attributes for better screen reader support

2. **Color Contrast:**
   - Use sufficient color contrast for all stepper elements
   - Don't rely solely on color to indicate state

3. **Descriptive Text:**
   - Add aria-label attributes to interactive elements
   - Ensure step labels are descriptive enough for screen readers

## Documentation Updates

- Update the `RSVP.md` file to reflect the new step structure
- Document the conditional visibility logic
- Document the component mapping between steps and section components