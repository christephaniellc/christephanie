import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { InvitationResponseEnum } from '@/types/api';
import StickFigureIcon from '@/components/StickFigureIcon';
import { useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { useAuth0 } from '@auth0/auth0-react';
import { guestSelector } from '@/store/family';


const WeddingAttendanceRadios = ({ guestId }: { guestId: string }) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const interested = guest?.rsvp?.invitationResponse || InvitationResponseEnum.Pending;
  const { user } = useAuth0();
  const isMe = guest?.auth0Id === user?.sub;
  const interestedOptions = ['... uh ¯\\_(ツ)_/¯ Who knows!', 'figuring things out.  only time will tell.', "It's fine, we can wait.", "I'm sure we'll all find out one day.", "not really a planner", 'still thinking about it for some reason.'];
  const interestedOption = useMemo(() => interestedOptions[Math.floor(Math.random() * interestedOptions.length)], [interested]);

  const response = useMemo(() => {
    return interested === 'Interested' ? 'interested!' : interested === 'Declined' ? 'unable to attend' : `Pending... (${interestedOption})`;
  }, [interested]);

  const queryKey = ['updateFamilyUnit'];
  const queryClient = useQueryClient();

  const familyQuery = queryClient.getQueryState(queryKey);

  const declined = useMemo(() => interested === 'Declined', [interested]);
  return (
    <Box display={'flex'} alignItems="center" justifyContent="flex-end" width="100%">
      {declined && (
        <Typography mr={2}><StickFigureIcon fontSize="small" ageGroup={guest?.ageGroup} loading={familyQuery?.fetchStatus === 'fetching'} />
        </Typography>)}
      <Typography
        variant="caption"
        mr={declined ? 2 : 0}
      >
        {isMe ? '' : `${guest?.firstName} is `}{response}
      </Typography>
    </Box>
  );
};

export default WeddingAttendanceRadios;