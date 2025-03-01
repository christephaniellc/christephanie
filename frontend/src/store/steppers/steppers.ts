import { atom, selector, selectorFamily } from 'recoil';
import React from 'react';
import { guestSelector } from '@/store/family';

export interface SaveTheDateStep {
  id: number;
  completed: boolean;
  label: string;
  description: string;
  component: React.JSX.Element | null;
  display: boolean;
}

export const stdTabIndex = atom<number>({
  key: 'saveTheDateStepperState',
  default: 0,
});

export const saveTheDateStepsState = atom<Record<string, SaveTheDateStep>>({
  key: 'saveTheDateStepper',
  default: {
    attendance: {
      id: 0,
      completed: false,
      label: 'Are you interested in attending the wedding?',
      description: '',
      component: null,
      display: true,
    },
    ageGroup: {
      id: 1,
      completed: false,
      label: 'What kind of person are we doling out food and drink to?',
      description: '',
      component: null,
      display: true,
    },
    foodPreferences: {
      id: 2,
      completed: true,
      label: 'What kind of life is being sacrificed for your meal?',
      description: '',
      component: null,
      display: true,
    },
    foodAllergies: {
      id: 3,
      completed: true,
      label: 'Which of these things will kill you if you eat them?',
      description: '',
      component: null,
      display: true,
    },
    communicationPreference: {
      id: 5,
      completed: false,
      label: 'How should we contact you?',
      description: '',
      component: null,
      display: true,
    },
    camping: {
      id: 4,
      completed: false,
      label: 'Accomodations',
      description: '(we have bathrooms!)',
      component: null,
      display: true,
    },
    mailingAddress: {
      id: 5,
      completed: false,
      label: 'Where should we send your invitation?',
      description: '',
      component: null,
      display: true,
    },
    comments: {
      id: 6,
      completed: false,
      label: 'Any comments?',
      description: '',
      component: null,
      display: true,
    },
  },
});

interface StdStepperProps {
  steps: Record<string, SaveTheDateStep>;
  tabIndex: number;
  totalTabs: number;
  currentStep: [string, SaveTheDateStep];
}

export const stdStepperState = selector<StdStepperProps>({
  key: 'stdStepperProps',
  get: ({ get }) => {
    const steps = get(saveTheDateStepsState);
    const tabIndex = get(stdTabIndex);
    const totalTabs = Object.keys(steps).length;
    const currentStep = Object.entries(steps)[tabIndex];

    return { steps, tabIndex, totalTabs, currentStep };
  },
})

