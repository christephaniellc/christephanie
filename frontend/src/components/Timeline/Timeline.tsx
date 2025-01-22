import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { Slider } from '@mui/material';
import { differenceInDays, subDays } from 'date-fns';
import Typography from '@mui/material/Typography';

const Timeline = () => {
  const [timeline, setTimeline] = useState<{ value: number, label: string | JSX.Element | undefined }[]>([]);
  const stdBegins = new Date('2025-01-01');
  const weddingDay = new Date('2025-07-05');

  const today = new Date();
  const stdResponseDue = new Date('2025-04-01');
  const foodPrefsDue = subDays(weddingDay, 45);
  const rehearsalDinnerRsvpDue = subDays(weddingDay, 60);

  const todayValue = Math.floor((today.valueOf() - stdBegins.valueOf()) / (weddingDay.valueOf() - stdBegins.valueOf()) * 100);
  const stdResponseDueValue = Math.floor((stdResponseDue.valueOf() - stdBegins.valueOf()) / (weddingDay.valueOf() - stdBegins.valueOf()) * 100);
  const displayTimeRemaining = (todayValue.valueOf() + stdResponseDueValue.valueOf()) / 2;
  const daysBetween = differenceInDays(stdResponseDue, today);
  // const foodPrefsDueValue = Math.floor((foodPrefsDue.valueOf() - stdBegins.valueOf()) / (weddingDay.valueOf() - stdBegins.valueOf()) * 100);

  const toSliderValue = (date: Date) => {
    return Math.floor((date.valueOf() - stdBegins.valueOf()) / (weddingDay.valueOf() - stdBegins.valueOf()) * 100);
  }


  useEffect(() => {
    const dummyTimelineItems = [
      {
        label: <Box><Typography variant="caption" width={'100%'}>STD</Typography><br /><Typography variant="caption"
                                                                                                   width={'100%'}>Begins!</Typography></Box>,
        value: 1,
      },
      {
        label: `${daysBetween} days`,
        value: displayTimeRemaining,
      },
      {
        label: undefined,
        value: toSliderValue(today),
      },
      {
        label: `STD Response Due`,
        value: toSliderValue(stdResponseDue),
      },
      {
        label: `Rehearsal Dinner RSVP Due`,
        value: toSliderValue(rehearsalDinnerRsvpDue),
      },
      {
        label: `Food Preferences Due`,
        value: toSliderValue(foodPrefsDue),
      },
      {
        label: 'Wedding Day!',
        value: 100,
      },
    ];
    setTimeline(dummyTimelineItems);
  }, []);

  useEffect(() => {
    console.log('timeline', timeline);
  }, [timeline]);


  return (
    <Box px={8} height={75} mx={'auto'} borderTop="2px solid gold" width={'800px'} maxWidth="3200px"
         sx={{ overflow: 'scroll' }}>
      <TimelineSlider
        defaultValue={todayValue}
        valueLabelFormat={'Today'}
        step={null}
        marks={timeline}
        start={0}
        end={10}
        valueLabelDisplay={'auto'}
      />
    </Box>
  );
};

export default Timeline;

const TimelineSlider = styled(Slider)(({ theme }) => ({
  color: '#007bff',
  height: 5,
  width: '1000px',
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 0,
    width: 2,
    boxShadow: 'none',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: 'none',
    },
    '&:before': {
      boxShadow: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    top: 30,
  },
  '& .MuiSlider-markLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    border: '1px solid gold',
    backgroundColor: 'black',
    padding: '2px 4px',
    zIndex: 10000,
    top: 'auto',
    bottom: 'auto',
    color: theme.palette.text.primary,
    maxWidth: '75px',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    '&::before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: '#000',
      ...theme.applyStyles('dark', {
        color: '#fff',
      }),
    },
  },
  '& .MuiSlider-track': {
    border: 'none',
    backgroundColor: 'transparent',
    height: 5,
  },
  '& .MuiSlider-rail': {
    borderBottom: `2px dotted ${theme.palette.secondary.main}`,
    backgroundColor: 'transparent',
  },
  ...theme.applyStyles('dark', {
    color: '#0a84ff',
  }),
}));