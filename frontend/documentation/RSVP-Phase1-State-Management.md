# RSVP Page - Phase 1: State Management Setup

This document outlines the implementation details for setting up the RSVP-specific state management.

## Overview

We need to create RSVP-specific state management separate from the Save-the-Date state to handle the RSVP flow independently. This allows us to build on the Save-the-Date responses while creating a distinct user experience for the final RSVP process.

## Refactoring and Implementation Steps

### 1. Refactor Stepper File Structure

We need a cleaner structure to handle multiple steppers:

- Rename `steppers.ts` to `saveTheDateStepper.ts` to be more specific
- Keep `rsvpStepper.ts` for RSVP-specific state
- Create an `index.ts` file to export all stepper states

This approach will make it easier to maintain separate stepper flows while keeping the code organized.

### 2. Define RSVP Step Structure

RSVP steps will be similar to SaveTheDateStep but with RSVP-specific content:

```typescript
export interface RsvpStep {
  id: number;
  completed: boolean;
  label: string;
  description: string;
  component: React.JSX.Element | null;
  display: boolean;
}
```

### 3. Define RSVP-Specific Steps

The RSVP process should include these steps:
- Welcome/Introduction
- Wedding Attendance (Confirm/Decline)
- Rehearsal Dinner (for selected guests only)
- Food Preferences (Confirm/Update)
- Transportation Needs
- Accommodation Confirmation
- Final Comments
- Summary

### 4. Update store/steppers/index.ts

Create and export all stepper states from the main index file to make them accessible throughout the application.

## Code Changes

### Create src/store/steppers/rsvpStepper.ts

```typescript
import { atom, selector } from 'recoil';
import React from 'react';

export interface RsvpStep {
  id: number;
  completed: boolean;
  label: string;
  description: string;
  component: React.JSX.Element | null;
  display: boolean;
}

export const rsvpTabIndex = atom<number>({
  key: 'rsvpStepperState',
  default: 0,
});

export const rsvpStepsState = atom<Record<string, RsvpStep>>({
  key: 'rsvpStepper',
  default: {
    welcome: {
      id: 0,
      completed: true,
      label: 'Welcome to the RSVP Process',
      description: 'Please confirm your attendance',
      component: null,
      display: true,
    },
    weddingAttendance: {
      id: 1,
      completed: false,
      label: 'Will you be attending our wedding?',
      description: 'Please confirm your final attendance',
      component: null,
      display: true,
    },
    rehearsalDinner: {
      id: 2,
      completed: false,
      label: 'Rehearsal Dinner Attendance',
      description: 'For invited guests only',
      component: null,
      display: true, // This will be conditionally set based on guest status
    },
    foodPreferences: {
      id: 3,
      completed: false,
      label: 'Confirm Food Preferences',
      description: 'Review and update your meal choices',
      component: null,
      display: true,
    },
    transportation: {
      id: 4,
      completed: false,
      label: 'Transportation Needs',
      description: 'Let us know if you need transportation assistance',
      component: null,
      display: true,
    },
    accommodation: {
      id: 5,
      completed: false,
      label: 'Accommodation Plans',
      description: 'Confirm your accommodation arrangements',
      component: null,
      display: true,
    },
    comments: {
      id: 6,
      completed: false,
      label: 'Additional Comments',
      description: 'Any last questions or requests?',
      component: null,
      display: true,
    },
    summary: {
      id: 7,
      completed: true,
      label: 'RSVP Summary',
      description: 'Review your RSVP information',
      component: null,
      display: true,
    },
  },
});

interface RsvpStepperProps {
  steps: Record<string, RsvpStep>;
  tabIndex: number;
  totalTabs: number;
  currentStep: [string, RsvpStep];
}

export const rsvpStepperState = selector<RsvpStepperProps>({
  key: 'rsvpStepperProps',
  get: ({ get }) => {
    const steps = get(rsvpStepsState);
    const tabIndex = get(rsvpTabIndex);
    const totalTabs = Object.keys(steps).length;
    const currentStep = Object.entries(steps)[tabIndex];

    return { steps, tabIndex, totalTabs, currentStep };
  },
});
```

### Update src/store/steppers/index.ts

```typescript
// Export save-the-date stepper state
export * from './steppers';

// Export RSVP stepper state
export * from './rsvpStepper';
```

## Implementation Status

The following changes have been completed:

1. ✅ Refactored stepper file structure:
   - Renamed `steppers.ts` to `saveTheDateStepper.ts` for clarity
   - Created an `index.ts` file to export all stepper states
   - Kept `rsvpStepper.ts` for RSVP-specific state

2. ✅ Created RSVP state management in rsvpStepper.ts:
   - Defined `RsvpStep` interface
   - Created `rsvpTabIndex` atom
   - Created `rsvpStepsState` atom with RSVP-specific steps
   - Created `rsvpStepperState` selector

3. ✅ Updated RSVPStepper component:
   - Changed imports to use RSVP-specific state
   - Updated URL navigation to use `/rsvp` routes
   - Updated references from SaveTheDate to RSVP-specific terminology

4. ✅ Updated RSVPPage component:
   - Changed imports to use RSVP-specific state
   - Updated to use RSVPStepper component
   - Updated navigation to use `/rsvp` routes

## Next Steps

These items still need to be implemented:

1. Create WeddingAttendanceRadios component for RSVP-specific attendance options
2. Create RehearsalDinnerAttendance component for selected guests
3. Update SummaryView to show RSVP-specific information
4. Add API endpoints and handlers for RSVP status changes
5. Add RSVP-specific MTV title or update visual elements to distinguish from Save-the-Date