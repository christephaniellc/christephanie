import { useState, useEffect, useCallback } from 'react';
import { PhotoGridItem, CardOrientation, PhotoVariant } from '../types/types';
import EngagementPhoto1 from '@/assets/engagement-photos/topher_and_steph_rsvp1.jpg';
import EngagementPhoto2 from '@/assets/engagement-photos/topher_and_steph_rsvp2.jpg';
import EngagementPhoto3 from '@/assets/engagement-photos/topher_and_steph_rsvp3.jpg';
import EngagementPhoto4 from '@/assets/engagement-photos/topher_and_steph_rsvp4.jpg';
import EngagementPhoto8 from '@/assets/engagement-photos/topher_and_steph_rsvp8.jpg';
import EngagementPhoto5 from '@/assets/engagement-photos/bremerhaven.jpg';
import EngagementPhoto6 from '@/assets/engagement-photos/burn_night.jpg';
import EngagementPhoto7 from '@/assets/engagement-photos/hammock.jpg';
import EngagementPhoto9 from '@/assets/engagement-photos/oktoberfest.jpg';
import EngagementPhoto10 from '@/assets/engagement-photos/roadtrip.jpg';
import { atom, useRecoilState, atomFamily, selector } from 'recoil';

// Recoil atoms for photo grid state
const horizontalPhotoGridState = atom<PhotoGridItem[]>({
  key: 'horizontalPhotoGridState',
  default: []
});

const verticalPhotoGridState = atom<PhotoGridItem[]>({
  key: 'verticalPhotoGridState',
  default: []
});

const horizontalSelectedVariantState = atom<string>({
  key: 'horizontalSelectedVariantState',
  default: 'h-grid-4' // Default layout ID
});

const verticalSelectedVariantState = atom<string>({
  key: 'verticalSelectedVariantState',
  default: 'v-main-top' // Default layout ID
});

// Preset variations for horizontal layout
const horizontalPresets: PhotoVariant[] = [
  // 1. Classic grid of 4 photos (2x2)
  {
    id: 'h-grid-4',
    name: 'Grid (4 photos)',
    description: 'Four photos in a 2×2 grid layout',
    layout: [
      { id: 1, photoSrc: EngagementPhoto1, position: [1, 1], isLocked: false, objectPosition: 'center' },
      { id: 2, photoSrc: EngagementPhoto2, position: [1, 2], isLocked: false, objectPosition: 'center 40%' },
      { id: 3, photoSrc: EngagementPhoto3, position: [2, 1], isLocked: false, objectPosition: 'center 30%' },
      { id: 4, photoSrc: EngagementPhoto4, position: [2, 2], isLocked: false, objectPosition: 'center 40%' }
    ]
  },
  
  // 2. Tall photo on left, two stacked on right (3 photos)
  {
    id: 'h-tall-left-stacked-right',
    name: 'Tall Left',
    description: 'Tall photo on left, two stacked on right',
    layout: [
      { id: 1, photoSrc: EngagementPhoto3, position: [1, 1], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' },
      { id: 1, photoSrc: EngagementPhoto3, position: [2, 1], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' },
      { id: 2, photoSrc: EngagementPhoto2, position: [1, 2], isLocked: false, objectPosition: 'center 40%' },
      { id: 3, photoSrc: EngagementPhoto1, position: [2, 2], isLocked: false, objectPosition: 'center 40%' }
    ]
  },
  
  // 3. Two wide on top, one wide on bottom (3 photos)
  {
    id: 'h-two-top-one-bottom',
    name: 'Two Top',
    description: 'Two photos on top, one wide on bottom',
    layout: [
      { id: 1, photoSrc: EngagementPhoto1, position: [1, 1], isLocked: false, objectPosition: 'center' },
      { id: 2, photoSrc: EngagementPhoto2, position: [1, 2], isLocked: false, objectPosition: 'center 40%' },
      { id: 3, photoSrc: EngagementPhoto8, position: [2, 1], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' },
      { id: 3, photoSrc: EngagementPhoto8, position: [2, 2], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' }
    ]
  },
  
  // 4. One wide on top, two wide on bottom (3 photos)
  {
    id: 'h-one-top-two-bottom',
    name: 'One Top',
    description: 'One wide photo on top, two on bottom',
    layout: [
      { id: 1, photoSrc: EngagementPhoto4, position: [1, 1], isLocked: false, objectPosition: 'center', objectFit: 'cover' },
      { id: 1, photoSrc: EngagementPhoto4, position: [1, 2], isLocked: false, objectPosition: 'center', objectFit: 'cover' },
      { id: 2, photoSrc: EngagementPhoto3, position: [2, 1], isLocked: false, objectPosition: 'center 40%' },
      { id: 3, photoSrc: EngagementPhoto8, position: [2, 2], isLocked: false, objectPosition: 'center 30%' }
    ]
  },
  
  // 5. Two tall photos side by side
  {
    id: 'h-two-tall',
    name: 'Two Tall',
    description: 'Two tall photos side by side',
    layout: [
      { id: 1, photoSrc: EngagementPhoto1, position: [1, 1], isLocked: false, objectPosition: 'center' },
      { id: 1, photoSrc: EngagementPhoto1, position: [2, 1], isLocked: false, objectPosition: 'center' },
      { id: 2, photoSrc: EngagementPhoto2, position: [1, 2], isLocked: false, objectPosition: 'center 40%' },
      { id: 2, photoSrc: EngagementPhoto2, position: [2, 2], isLocked: false, objectPosition: 'center 40%' }
    ]
  },
  
  // 6. Two wide photos stacked
  {
    id: 'h-two-wide',
    name: 'Two Wide',
    description: 'Two wide photos stacked vertically',
    layout: [
      { id: 1, photoSrc: EngagementPhoto3, position: [1, 1], isLocked: false, objectPosition: 'center', objectFit: 'cover' },
      { id: 1, photoSrc: EngagementPhoto3, position: [1, 2], isLocked: false, objectPosition: 'center', objectFit: 'cover' },
      { id: 2, photoSrc: EngagementPhoto8, position: [2, 1], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' },
      { id: 2, photoSrc: EngagementPhoto8, position: [2, 2], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' }
    ]
  }
];

// Preset variations for vertical layout
const verticalPresets: PhotoVariant[] = [
  // 1. Classic 3-photo vertical layout (one large on top, two below)
  {
    id: 'v-main-top',
    name: 'Feature Top',
    description: 'One large photo on top with two smaller photos below',
    layout: [
      { id: 1, photoSrc: EngagementPhoto2, position: [1, 1], isLocked: false, objectPosition: 'center 30%' },
      { id: 2, photoSrc: EngagementPhoto3, position: [2, 1], isLocked: false, objectPosition: 'center' },
      { id: 3, photoSrc: EngagementPhoto8, position: [2, 2], isLocked: false, objectPosition: 'center' }
    ]
  },
  
  // 2. Two photos on top, one large on bottom
  {
    id: 'v-main-bottom',
    name: 'Feature Bottom',
    description: 'Two small photos on top with one large photo below',
    layout: [
      { id: 1, photoSrc: EngagementPhoto3, position: [1, 1], isLocked: false, objectPosition: 'center' },
      { id: 2, photoSrc: EngagementPhoto8, position: [1, 2], isLocked: false, objectPosition: 'center' },
      { id: 3, photoSrc: EngagementPhoto2, position: [2, 1], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' }
    ]
  },
  
  // 3. Grid of 4 small photos
  {
    id: 'v-grid-4',
    name: 'Grid (4)',
    description: 'Four photos in a grid pattern',
    layout: [
      { id: 1, photoSrc: EngagementPhoto1, position: [1, 1], isLocked: false, objectPosition: 'center' },
      { id: 2, photoSrc: EngagementPhoto2, position: [1, 2], isLocked: false, objectPosition: 'center' },
      { id: 3, photoSrc: EngagementPhoto3, position: [2, 1], isLocked: false, objectPosition: 'center 30%' },
      { id: 4, photoSrc: EngagementPhoto4, position: [2, 2], isLocked: false, objectPosition: 'center 40%' }
    ]
  },
  
  // 4. Two wide photos stacked
  {
    id: 'v-two-wide',
    name: 'Two Wide',
    description: 'Two wide photos stacked vertically',
    layout: [
      { id: 1, photoSrc: EngagementPhoto1, position: [1, 1], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' },
      { id: 1, photoSrc: EngagementPhoto1, position: [1, 2], isLocked: false, objectPosition: 'center 30%', objectFit: 'cover' },
      { id: 2, photoSrc: EngagementPhoto8, position: [2, 1], isLocked: false, objectPosition: 'center', objectFit: 'cover' },
      { id: 2, photoSrc: EngagementPhoto8, position: [2, 2], isLocked: false, objectPosition: 'center', objectFit: 'cover' }
    ]
  },
  
  // 5. Two tall photos side by side
  {
    id: 'v-two-tall',
    name: 'Two Tall',
    description: 'Two tall photos side by side',
    layout: [
      { id: 1, photoSrc: EngagementPhoto3, position: [1, 1], isLocked: false, objectPosition: 'center' },
      { id: 2, photoSrc: EngagementPhoto4, position: [1, 2], isLocked: false, objectPosition: 'center 40%' },
      { id: 1, photoSrc: EngagementPhoto3, position: [2, 1], isLocked: false, objectPosition: 'center' },
      { id: 2, photoSrc: EngagementPhoto4, position: [2, 2], isLocked: false, objectPosition: 'center 40%' }
    ]
  },
  
  // 6. Three photos with large one on left
  {
    id: 'v-tall-left',
    name: 'Tall Left',
    description: 'Tall photo on left, two on right',
    layout: [
      { id: 1, photoSrc: EngagementPhoto1, position: [1, 1], isLocked: false, objectPosition: 'center 30%' },
      { id: 2, photoSrc: EngagementPhoto4, position: [1, 2], isLocked: false, objectPosition: 'center' },
      { id: 1, photoSrc: EngagementPhoto1, position: [2, 1], isLocked: false, objectPosition: 'center 30%' },
      { id: 3, photoSrc: EngagementPhoto2, position: [2, 2], isLocked: false, objectPosition: 'center' }
    ]
  }
];

const availablePhotos = [
  EngagementPhoto1,
  EngagementPhoto2,
  EngagementPhoto3,
  EngagementPhoto4,
  EngagementPhoto5,
  EngagementPhoto6,
  EngagementPhoto7,
  EngagementPhoto8,
  EngagementPhoto9,
  EngagementPhoto10
];

export const usePhotoVariants = (orientation: CardOrientation) => {
  // Get the appropriate presets based on orientation
  const presetVariants = orientation === 'horizontal' ? horizontalPresets : verticalPresets;
  
  // Use Recoil state for the current photo grid based on orientation
  const [currentPhotoGrid, setCurrentPhotoGrid] = useRecoilState(
    orientation === 'horizontal' ? horizontalPhotoGridState : verticalPhotoGridState
  );
  
  // Use Recoil state for the selected variant ID based on orientation
  const [selectedVariantId, setSelectedVariantId] = useRecoilState(
    orientation === 'horizontal' ? horizontalSelectedVariantState : verticalSelectedVariantState
  );
  
  // Initialize state if empty
  useEffect(() => {
    if (currentPhotoGrid.length === 0) {
      // Find the preset that matches our selected variant ID
      const selectedPreset = presetVariants.find(variant => variant.id === selectedVariantId) || presetVariants[0];
      setCurrentPhotoGrid(selectedPreset.layout.map(item => ({...item})));
    }
  }, [currentPhotoGrid.length, presetVariants, selectedVariantId, setCurrentPhotoGrid]);
  
  // Toggle the lock state of a photo
  const toggleLock = useCallback((photoId: number) => {
    setCurrentPhotoGrid(prevGrid => 
      prevGrid.map(item => 
        item.id === photoId 
          ? { ...item, isLocked: !item.isLocked } 
          : item
      )
    );
  }, [setCurrentPhotoGrid]);
  
  // Set a specific variant
  const setSelectedVariant = useCallback((variant: PhotoVariant) => {
    // Update the selected variant ID in Recoil state
    setSelectedVariantId(variant.id);
    
    // Preserve locked photos from current grid
    const lockedPhotos = currentPhotoGrid.filter(item => item.isLocked);
    
    if (lockedPhotos.length === 0) {
      // If no photos are locked, just apply the new variant
      // Create a deep copy to ensure React detects the change
      setCurrentPhotoGrid(variant.layout.map(item => ({...item})));
    } else {
      // Apply the variant but preserve the locked photos
      const newGrid = [...variant.layout]; // Start with the new layout
      
      // Replace unlocked photos with ones from the variant
      // Keep locked photos in their positions
      lockedPhotos.forEach(lockedPhoto => {
        // Find the index in the new grid that matches the locked photo's position
        const indexToReplace = newGrid.findIndex(item => 
          item.position[0] === lockedPhoto.position[0] && 
          item.position[1] === lockedPhoto.position[1]
        );
        
        if (indexToReplace !== -1) {
          // Replace with the locked photo
          newGrid[indexToReplace] = { ...lockedPhoto };
        }
      });
      
      setCurrentPhotoGrid(newGrid);
    }
  }, [currentPhotoGrid, setCurrentPhotoGrid, setSelectedVariantId]);
  
  // Randomize the photo layout while respecting locked photos
  const randomizePhotos = useCallback(() => {
    // Create a copy of the current grid
    const newGrid = [...currentPhotoGrid];
    
    // Get indices of unlocked photos
    const unlockedIndices = newGrid
      .map((item, index) => item.isLocked ? -1 : index)
      .filter(index => index !== -1);
    
    // If all photos are locked, do nothing
    if (unlockedIndices.length === 0) return;
    
    // Shuffle the unlocked photos (Fisher-Yates shuffle)
    for (let i = unlockedIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap photos (not just indices)
      const temp = { ...newGrid[unlockedIndices[i]] };
      newGrid[unlockedIndices[i]] = { ...newGrid[unlockedIndices[j]] };
      newGrid[unlockedIndices[j]] = temp;
      
      // Keep the positions the same
      const tempPosition: [number, number] = [...newGrid[unlockedIndices[i]].position] as [number, number];
      newGrid[unlockedIndices[i]].position = [...newGrid[unlockedIndices[j]].position] as [number, number];
      newGrid[unlockedIndices[j]].position = tempPosition;
    }
    
    // Randomly change unlocked photos to different ones from available photos
    unlockedIndices.forEach(index => {
      // 50% chance to change the photo
      if (Math.random() > 0.5) {
        const randomPhotoIndex = Math.floor(Math.random() * availablePhotos.length);
        newGrid[index] = {
          ...newGrid[index],
          photoSrc: availablePhotos[randomPhotoIndex],
          objectPosition: `center ${Math.floor(Math.random() * 60)}%`
        };
      }
    });
    
    setCurrentPhotoGrid(newGrid);
  }, [currentPhotoGrid, setCurrentPhotoGrid]);
  
  // Update photo position
  const updatePhotoPosition = useCallback((photoId: number, newPosition: string) => {
    setCurrentPhotoGrid(prevGrid => 
      prevGrid.map(item => 
        item.id === photoId 
          ? { ...item, objectPosition: newPosition } 
          : item
      )
    );
  }, [setCurrentPhotoGrid]);
  
  // Update photo source
  const updatePhotoSource = useCallback((photoId: number, newPhotoSrc: string) => {
    setCurrentPhotoGrid(prevGrid => 
      prevGrid.map(item => 
        item.id === photoId 
          ? { ...item, photoSrc: newPhotoSrc } 
          : item
      )
    );
  }, [setCurrentPhotoGrid]);

  return {
    currentPhotoGrid,
    presetVariants,
    availablePhotos,
    randomizePhotos,
    toggleLock,
    setSelectedVariant,
    updatePhotoPosition,
    updatePhotoSource,
    selectedVariantId
  };
};