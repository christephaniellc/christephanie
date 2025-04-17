# RSVP Stepper Update Plan

## Issue Description
The RSVP stepper is not displaying all expected steps. During recent merges, changes to the step definitions and visibility logic have affected which steps are shown. Currently, only a subset of steps is visible to users.

## Root Causes
1. The `basicSteps` array in `RSVPStepper.tsx` only includes certain steps (`['weddingAttendance', 'fourthOfJulyAttendance', 'mailingAddress', 'comments', 'summary']`), which limits what's visible when `atLeastOneAttending` is false
2. The `atLeastOneAttending` calculation in `familyGuestsStates` selector may be incorrectly evaluating to false
3. The visibility logic in the component conditionally filters steps based on attendance state

## Action Plan

### 1. Add Basic Tests for RSVPStepper Component
- Create `RSVPStepper.spec.tsx` to test the component rendering
- Test step visibility in both attending and non-attending scenarios
- Verify that step navigation works as expected

### 2. Test and Fix Family State Calculation
- Add tests for `atLeastOneAttending` calculation in `family.index.spec.tsx`
- Verify that the calculation correctly identifies when at least one person is attending
- Fix any issues with the calculation to ensure proper step visibility

### 3. Update Step Visibility Logic (if needed)
- Consider updating the `basicSteps` array to include all steps that should always be visible
- Alternatively, modify the visibility condition to show all steps with `display: true`

### 4. Test Step Definitions
- Verify that all steps in `rsvpStepsState` have the correct `display` property set
- Ensure step IDs are correctly ordered and match the component rendering logic

## Testing Process
We'll focus on targeted testing instead of aiming for 100% coverage:
1. Test components as we build or modify them
2. Focus on testing the specific behavior that was broken
3. Use test-driven development for fixes: write failing tests first, then implement fixes

## Immediate Next Steps
1. Create RSVPStepper test that reproduces the issue
2. Test and fix the `atLeastOneAttending` calculation 
3. Update the visibility logic to ensure all required steps are visible
4. Verify the fix with both automated tests and manual testing

## Long-term Considerations
- Consider refactoring the stepper logic to be more resilient to changes in step definitions
- Improve documentation of the step visibility conditions
- Add more comprehensive tests for all edge cases