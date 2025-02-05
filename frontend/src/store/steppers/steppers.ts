import { atom } from 'recoil';

export interface SaveTheDateStep {
  id: number;
  completed: boolean;
  label: string;
  description: string;
  component: Element | null;
}

export const saveTheDateStepperState = atom<Record<string, SaveTheDateStep>>({
  key: 'saveTheDateStepper',
  default: {
    attendance: {
      id: 0,
      completed: false,
      label: 'Who’s Interested?',
      description: '',
      component: null,
    },
    mailingAddress: {
      id: 2,
      completed: false,
      label: 'Where should we send your invitation?',
      description: "",
      component: null,
    },
    foodAllergies: {
      id: 3,
      completed: false,
      label: 'Any food allergies?',
      description: "",
      component: null,
    },
    communicationPreference: {
      id: 4,
      completed: false,
      label: 'How should we contact you?',
      description: "",
      component: null,
    },
    camping: {
      id: 5,
      completed: false,
      label: 'Camping',
      description: "",
      component: null,
    },
    comments: {
      id: 6,
      completed: false,
      label: 'Any comments?',
      description: "",
      component: null,
    },
  }
});

