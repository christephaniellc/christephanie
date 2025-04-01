import { atom, selector, selectorFamily } from 'recoil';
import React from 'react';

export interface RSVPStep {
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

export const rsvpStepsState = atom<Record<string, RSVPStep>>({
  key: 'rsvpStepper',
  default: {
    attendance: {
      id: 0,
      completed: false,
      label: 'Is your family attending the wedding?',
      description: '',
      component: null,
      display: true,
    },
    ageGroup: {
      id: 1,
      completed: false,
      label: 'What kind of people are we catering to?',
      description: '',
      component: null,
      display: true,
    },
    communicationPreference: {
      id: 2,
      completed: false,
      label: 'How can we notify you about wedding updates?',
      description: '',
      component: null,
      display: true,
    },
    foodPreferences: {
      id: 3,
      completed: true,
      label: 'What kind of life is being sacrificed for your meals?',
      description: '',
      component: null,
      display: true,
    },
    foodAllergies: {
      id: 4,
      completed: true,
      label: 'Which of these things will cause great distress if you eat them?',
      description: '',
      component: null,
      display: true,
    },
    camping: {
      id: 5,
      completed: false,
      label: 'Camping? Hotel? Tell us what you\'re thinking!',
      description: '(we have bathrooms!)',
      component: null,
      display: true,
    },
    mailingAddress: {
      id: 6,
      completed: false,
      label: "What's your snail mail?",
      description: '',
      component: null,
      display: true,
    },
    comments: {
      id: 7,
      completed: false,
      label: 'Any comments?',
      description: '',
      component: null,
      display: true,
    },
    summary: {
      id: 8,
      completed: true,
      label: 'Wedding Information Summary',
      description: 'Review your information',
      component: null,
      display: true,
    },
  },
});

interface RsvpStepperProps {
  steps: Record<string, RSVPStep>;
  tabIndex: number;
  totalTabs: number;
  currentStep: [string, RSVPStep];
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
