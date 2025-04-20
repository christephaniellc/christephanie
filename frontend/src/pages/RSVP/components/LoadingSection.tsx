import React from 'react';
import LoadingBox from '@/components/LoadingBox';

interface LoadingSectionProps {
  isError?: boolean;
  errorMessage?: string;
}

export const LoadingSection: React.FC<LoadingSectionProps> = ({ isError, errorMessage }) => {
  return <LoadingBox isError={isError} errorMessage={errorMessage} />;
};

export default LoadingSection;