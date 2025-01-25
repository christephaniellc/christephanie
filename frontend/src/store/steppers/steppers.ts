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
      id: 1,
      completed: false,
      label: 'Where should we send your invitation?',
      description: "",
      component: null,
    },
  }
});

