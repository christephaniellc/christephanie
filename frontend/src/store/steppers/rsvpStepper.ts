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
      label: 'Wedding Attendance',
      description: 'Please confirm your final attendance',
      component: null,
      display: true,
    },
    fourthOfJulyAttendance: {
      id: 1,
      completed: false,
      label: '4th of July BBQ Dinner Attendance',
      description: 'Join us for grilling and fireworks!',
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
      label: 'Confirm Food Allergies',
      description: 'Let us know about any dietary restrictions',
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
    mailingAddress: {
      id: 5,
      completed: false,
      label: 'Mailing Address',
      description: 'Provide your mailing address',
      component: null,
      display: true,
    },
    communicationPreferences: {
      id: 6,
      completed: false,
      label: 'Validate Communication Preferences',
      description: 'Confirm your communication preferences',
      component: null,
      display: true,
    },
    comments: {
      id: 7,
      completed: false,
      label: 'Additional Comments',
      description: 'Any last questions or requests?',
      component: null,
      display: true,
    },
    summary: {
      id: 8,
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