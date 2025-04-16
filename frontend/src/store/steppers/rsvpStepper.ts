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
      display: true, // This will be conditionally set based on guest status
    },
    foodPreferences: {
      id: 2,
      completed: false,
      label: 'Confirm Food Preferences',
      description: 'Review and update your meal choices',
      component: null,
      display: true,
    },
    foodAllergies: {
      id: 3,
      completed: false,
      label: 'Food Allergies',
      description: 'Let us know about any dietary restrictions',
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