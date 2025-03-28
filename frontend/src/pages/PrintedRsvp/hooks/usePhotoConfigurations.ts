import { useState, useCallback, useEffect } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { SavedPhotoConfiguration, PhotoGridItem, CardOrientation } from '../types/types';
import { InvitationDesignDto, OrientationEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { familyState } from '@/store/family';

// Local storage key for fallback storage when offline
const STORAGE_KEY = 'saved-photo-configurations';

export const usePhotoConfigurations = () => {
  const { apiInstance } = useApiContext();
  const family = useRecoilValue(familyState);
  // Use a placeholder ID if family data isn't available yet
  const familyUnitId = family?.invitationCode || 'temp-family-id';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<SavedPhotoConfiguration | null>(null);
  const [configurations, setConfigurations] = useState<SavedPhotoConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load configurations on mount
  useEffect(() => {
    refetch();
  }, []);
  
  // Convert InvitationDesignDto to SavedPhotoConfiguration
  const convertToSavedConfig = (design: InvitationDesignDto): SavedPhotoConfiguration => {
    const photoGrid = design.photoGridItems?.map(item => ({
      id: parseInt(item.id || '0', 10),
      photoSrc: item.photoSrc || '',
      position: [item.rowPosition || 0, item.columnPosition || 0] as [number, number],
      isLocked: item.isLocked || false,
      objectFit: item.objectFit || 'cover',
      objectPosition: item.objectPosition || 'center'
    })) || [];
    
    return {
      id: design.designId || undefined,
      name: design.name || 'Untitled Design',
      familyUnitId: family?.invitationCode || 'unknown',
      orientation: design.orientation === OrientationEnum.Portrait ? 'vertical' : 'horizontal',
      photoGrid: photoGrid,
      createdAt: design.dateCreated?.lastUpdate || new Date().toISOString(),
      lastModified: design.dateUpdated?.lastUpdate
    };
  };
  
  // Save configuration to API
  const saveConfiguration = useCallback(
    async (photoGrid: PhotoGridItem[], orientation: CardOrientation) => {
      if (!configName.trim() || !apiInstance) return;
      
      setIsSaving(true);
      
      try {
        const newConfig: SavedPhotoConfiguration = {
          name: configName.trim(),
          familyUnitId,
          orientation,
          photoGrid,
          createdAt: new Date().toISOString()
        };
        
        // Save to backend API
        const savedDesign = await apiInstance.saveInvitationDesign(newConfig);
        
        // Convert the response back to SavedPhotoConfiguration format
        const savedConfig = convertToSavedConfig(savedDesign);
        
        // Add to list
        setConfigurations(prev => [...prev, savedConfig]);
        
        // Reset form
        setConfigName('');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to save configuration to API:', error);
        setIsError(true);
        
        // Fallback to localStorage if API fails
        try {
          const localConfig: SavedPhotoConfiguration = {
            id: Date.now().toString(),
            name: configName.trim(),
            familyUnitId,
            orientation,
            photoGrid,
            createdAt: new Date().toISOString()
          };
          
          const storedConfigs = localStorage.getItem(STORAGE_KEY);
          const currentConfigs = storedConfigs ? JSON.parse(storedConfigs) : [];
          const updatedConfigs = [...currentConfigs, localConfig];
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
          setConfigurations(prev => [...prev, localConfig]);
          
          // Reset form even in failure case
          setConfigName('');
          setIsModalOpen(false);
        } catch (localError) {
          console.error('Failed to save configuration even to localStorage:', localError);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [configName, familyUnitId, apiInstance]
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
    async (id: string) => {
      if (!id || !apiInstance) return;
      
      setIsDeleting(true);
      
      try {
        // Delete from API
        await apiInstance.deleteInvitationDesign(id);
        
        // Update local state
        setConfigurations(prev => prev.filter(config => config.id !== id));
        
        // If this was the selected config, clear selection
        if (selectedConfig?.id === id) {
          setSelectedConfig(null);
        }
      } catch (error) {
        console.error('Failed to delete configuration from API:', error);
        setIsError(true);
        
        // Fallback to localStorage if API fails
        try {
          const storedConfigs = localStorage.getItem(STORAGE_KEY);
          if (storedConfigs) {
            const currentConfigs = JSON.parse(storedConfigs);
            const updatedConfigs = currentConfigs.filter(config => config.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));
            
            // Update local state anyway
            setConfigurations(prev => prev.filter(config => config.id !== id));
          }
        } catch (localError) {
          console.error('Failed to delete configuration even from localStorage:', localError);
        }
      } finally {
        setIsDeleting(false);
      }
    },
    [apiInstance, selectedConfig]
  );
  
  // Fetch configurations from API
  const refetch = useCallback(async () => {
    if (!apiInstance) {
      console.error('API instance not available');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch from API
      const designs = await apiInstance.getInvitationDesigns();
      
      // Convert designs to SavedPhotoConfiguration format
      const savedConfigs = designs.map(convertToSavedConfig);
      
      setConfigurations(savedConfigs);
      setIsError(false);
    } catch (error) {
      console.error('Failed to fetch configurations from API:', error);
      setIsError(true);
      
      // Fallback to localStorage if API fails
      try {
        const storedConfigs = localStorage.getItem(STORAGE_KEY);
        if (storedConfigs) {
          setConfigurations(JSON.parse(storedConfigs));
        }
      } catch (localError) {
        console.error('Failed to load configurations from localStorage:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiInstance]);
  
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