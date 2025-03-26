import { useState, useCallback } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { SavedPhotoConfiguration, PhotoGridItem, CardOrientation } from '../types/types';
import { useRecoilValue } from 'recoil';
import { familyState } from '@/store/family';

// Local storage key for temporary storage
const STORAGE_KEY = 'saved-photo-configurations';

export const usePhotoConfigurations = () => {
  const apiContext = useApiContext();
  const family = useRecoilValue(familyState);
  // Use a placeholder ID if family data isn't available yet
  const familyUnitId = family?.invitationCode || 'temp-family-id';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<SavedPhotoConfiguration | null>(null);
  const [configurations, setConfigurations] = useState<SavedPhotoConfiguration[]>(() => {
    try {
      const savedConfigs = localStorage.getItem(STORAGE_KEY);
      return savedConfigs ? JSON.parse(savedConfigs) : [];
    } catch (error) {
      console.error('Failed to load saved configurations:', error);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Save configuration to localStorage
  const saveConfiguration = useCallback(
    (photoGrid: PhotoGridItem[], orientation: CardOrientation) => {
      if (!configName.trim()) return;
      
      setIsSaving(true);
      
      try {
        const newConfig: SavedPhotoConfiguration = {
          id: Date.now().toString(), // Use timestamp as ID
          name: configName.trim(),
          familyUnitId,
          orientation,
          photoGrid,
          createdAt: new Date().toISOString()
        };
        
        // Add to list
        const updatedConfigs = [...configurations, newConfig];
        setConfigurations(updatedConfigs);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
        
        // Reset form
        setConfigName('');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to save configuration:', error);
        setIsError(true);
      } finally {
        setIsSaving(false);
      }
    },
    [configName, familyUnitId, configurations]
  );
  
  // Load a saved configuration
  const loadConfiguration = useCallback(
    (config: SavedPhotoConfiguration) => {
      setSelectedConfig(config);
      return config;
    },
    []
  );
  
  // Delete a saved configuration
  const deleteConfiguration = useCallback(
    (id: string) => {
      setIsDeleting(true);
      
      try {
        const updatedConfigs = configurations.filter(config => config.id !== id);
        setConfigurations(updatedConfigs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
      } catch (error) {
        console.error('Failed to delete configuration:', error);
        setIsError(true);
      } finally {
        setIsDeleting(false);
      }
    },
    [configurations]
  );
  
  // Refetch configurations (for simulated API)
  const refetch = useCallback(() => {
    setIsLoading(true);
    
    try {
      const savedConfigs = localStorage.getItem(STORAGE_KEY);
      if (savedConfigs) {
        setConfigurations(JSON.parse(savedConfigs));
      }
    } catch (error) {
      console.error('Failed to reload configurations:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Open the save configuration modal
  const openSaveModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);
  
  // Close the save configuration modal
  const closeSaveModal = useCallback(() => {
    setIsModalOpen(false);
    setConfigName('');
  }, []);
  
  return {
    configurations,
    selectedConfig,
    isLoading,
    isError,
    isSaving,
    isDeleting,
    configName,
    setConfigName,
    isModalOpen,
    openSaveModal,
    closeSaveModal,
    saveConfiguration,
    loadConfiguration,
    deleteConfiguration,
    refetch
  };
};