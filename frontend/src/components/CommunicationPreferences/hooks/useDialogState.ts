import { useState } from 'react';

export const useDialogState = () => {
  // Dialog state management
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isEmailVerifyDialogOpen, setIsEmailVerifyDialogOpen] = useState(false);
  const [isPhoneVerifyDialogOpen, setIsPhoneVerifyDialogOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedContactType, setSelectedContactType] = useState<'Email' | 'Text' | null>(null);

  // Email dialog handlers
  const handleOpenEmailDialog = () => {
    setIsEmailDialogOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setIsEmailDialogOpen(false);
  };

  const handleOpenEmailVerifyDialog = () => {    
    setIsEmailVerifyDialogOpen(true);
  };

  const handleCloseEmailVerifyDialog = () => {
    setIsEmailVerifyDialogOpen(false);
  };

  // Phone dialog handlers
  const handleOpenPhoneDialog = () => {
    setIsPhoneDialogOpen(true);
  };
  
  const handleClosePhoneDialog = () => {
    setIsPhoneDialogOpen(false);
  };
  
  const handleOpenPhoneVerifyDialog = () => {   
    setIsPhoneVerifyDialogOpen(true);
  };
  
  const handleClosePhoneVerifyDialog = () => {
    setIsPhoneVerifyDialogOpen(false);
  };

  return {
    // Dialog state
    isEmailDialogOpen,
    isPhoneDialogOpen,
    isEmailVerifyDialogOpen,
    isPhoneVerifyDialogOpen,
    isVerificationModalOpen,
    selectedContactType,
    
    // Email dialog handlers
    handleOpenEmailDialog,
    handleCloseEmailDialog,
    handleOpenEmailVerifyDialog,
    handleCloseEmailVerifyDialog,
    
    // Phone dialog handlers
    handleOpenPhoneDialog,
    handleClosePhoneDialog,
    handleOpenPhoneVerifyDialog,
    handleClosePhoneVerifyDialog,
    
    // Other state setters
    setIsVerificationModalOpen,
    setSelectedContactType
  };
};