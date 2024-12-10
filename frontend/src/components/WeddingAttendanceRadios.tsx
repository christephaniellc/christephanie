import * as React from 'react';
import { styled } from '@mui/material/styles';
import RadioGroup, { useRadioGroup } from '@mui/material/RadioGroup';
import FormControlLabel, {
  FormControlLabelProps,
} from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { useRsvpContext } from '../context/Rsvp/RsvpContext';
import { InvitationResponse } from '../types/types';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import StickFigureIcon from './StickFigureIcon';

interface StyledFormControlLabelProps extends FormControlLabelProps {
  checked: boolean;
}

const StyledFormControlLabel = styled((props: StyledFormControlLabelProps) => (
  <FormControlLabel {...props} />
))(({ theme }) => ({
  variants: [
    {
      props: { checked: true },
      style: {
        '.MuiFormControlLabel-label': {
          color: theme.palette.primary.main,
        },
      },
    },
  ],
}));

function MyFormControlLabel(props: FormControlLabelProps) {
  const radioGroup = useRadioGroup();

  let checked = false;

  if (radioGroup) {
    checked = radioGroup.value === props.value;
  }

  return <StyledFormControlLabel checked={checked} {...props} />;
}

interface WeddingAttendanceRadiosProps {
  interested: InvitationResponse;
}

const WeddingAttendanceRadios = ({ interested }: WeddingAttendanceRadiosProps) => {
  const response = useMemo(() => {
      return interested === 'Interested' ? 'interested!' : interested === 'Declined' ? 'not attending!' : 'still thinking about it.';
    }, [interested])

  const declined = useMemo(() => interested === 'Declined', [interested]);
  return (
    <Box display={'flex'} alignItems='center'>
      <Typography variant='caption' mr={declined ? 2 : 0}>I'm {response}</Typography>
      {declined && <StickFigureIcon fontSize='small' />}
    </Box>
  );
}

export default WeddingAttendanceRadios;