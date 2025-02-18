import { AgeGroupEnum } from '@/types/api';

export interface StickFigureIconProps {
  fontSize?: 'inherit' | 'small' | 'large' | 'medium' | undefined;
  color?: 'inherit' | 'primary' | 'secondary' | 'action' | 'disabled' | 'error' | 'info' | 'success' | 'warning' | undefined | string;
  hidden?: boolean;
  error?: boolean;
  loading?: boolean;
  rotation?: number;
  ageGroup?: AgeGroupEnum;
}