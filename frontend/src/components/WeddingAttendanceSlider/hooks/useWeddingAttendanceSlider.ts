import { useState, useEffect, useMemo, SyntheticEvent } from 'react';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { InvitationResponseEnum, RsvpEnum } from '@/types/api';
import debounce from 'lodash/debounce';

export const useWeddingAttendanceSlider = (guestId: string) => {
  const [, familyActions] = useFamily();
  const guest = useRecoilValue(guestSelector(guestId));
  const [isUpdating, setIsUpdating] = useState(false);
  const [sliderPosition, setSliderPosition] = useState<number>(0);
  
  // Determine initial slider position based on guest's response status
  const getSliderPosition = () => {
    if (!guest) return 0;
    
    // Position 3: Formally attending (highest priority)
    if (guest.rsvp?.wedding === RsvpEnum.Attending) {
      return 3;
    }
    
    // Position 2: Interested but not formally RSVP'd
    if (guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested && 
        (!guest.rsvp?.wedding || guest.rsvp.wedding === RsvpEnum.Pending)) {
      return 2;
    }
    
    // Position 1: Declined (either wedding or invitation response)
    if (guest.rsvp?.wedding === RsvpEnum.Declined ||
        guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined) {
      return 1;
    }
    
    // Position 0: Pending (default)
    return 0;
  };

  // Initialize slider position when guest data changes
  useEffect(() => {
    if (guest) {
      const position = getSliderPosition();
      console.log(`Setting initial position for ${guest.firstName || guestId} to:`, position);
      setSliderPosition(position);
    }
  }, [guest, guestId]);

  // Check if guest is attending (position 3)
  const isAttending = sliderPosition === 3;
  
  // Update database with debounce to avoid rapid updates
  const updateStatusInDatabase = useMemo(
    () => debounce(async (position: number) => {
      if (!guest) return;
      
      console.log(`Updating database for ${guest.firstName || guestId} to position:`, position);
      setIsUpdating(true);
      try {
        // Map slider position to invitation response and wedding RSVP
        let invitationResponse = InvitationResponseEnum.Pending;
        let weddingRsvp = RsvpEnum.Pending;
        
        switch (position) {
          case 1: // Declined
            invitationResponse = InvitationResponseEnum.Declined;
            weddingRsvp = RsvpEnum.Declined;
            break;
          case 2: // Interested
            invitationResponse = InvitationResponseEnum.Interested;
            weddingRsvp = RsvpEnum.Pending;
            break;
          case 3: // Attending
            invitationResponse = InvitationResponseEnum.Interested;
            weddingRsvp = RsvpEnum.Attending;
            break;
          default: // Pending (0)
            invitationResponse = InvitationResponseEnum.Pending;
            weddingRsvp = RsvpEnum.Pending;
        }
        
        console.log(`Mapped to invitationResponse=${invitationResponse}, wedding=${weddingRsvp}`);
        
        // Update both invitation response and wedding RSVP
        await familyActions.patchFamilyGuestMutation.mutate({
          updatedGuest: {
            guestId,
            invitationResponse,
            wedding: weddingRsvp,
          },
        });
        
        await familyActions.getFamily();
      } catch (error) {
        console.error('Error updating attendance status', error);
      } finally {
        setIsUpdating(false);
      }
    }, 500),
    [guest, guestId, familyActions]
  );

  // Handle slider change event - accept React's event type AND Material-UI's event type
  const handleSliderChange = (event: Event | SyntheticEvent, newValue: number | number[]) => {
    const position = Array.isArray(newValue) ? newValue[0] : newValue;
    console.log(`Slider changed for ${guest?.firstName || guestId} to:`, position);
    setSliderPosition(position);
    updateStatusInDatabase(position);
  };

  return {
    sliderPosition,
    handleSliderChange,
    isUpdating,
    guest,
    isAttending
  };
};