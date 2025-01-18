import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { Slider } from '@mui/material';

const Timeline = () => {
  const [timeline, setTimeline] = useState<{ value: number, label: string }[]>([]);
  const stdBegins = new Date("2025-01-01").valueOf();
  const weddingDay = new Date("2025-07-05").valueOf();

  const today = new Date().valueOf();
  const stdResponseDue = new Date("2025-04-01").valueOf();

  const todayValue = Math.floor((today - stdBegins) / (weddingDay - stdBegins) * 100);
  const stdResponseDueValue = Math.floor((stdResponseDue - stdBegins) / (weddingDay - stdBegins) * 100);

  useEffect(() => {
    const dummyTimelineItems = [
      {
        label: 'STD Begins!',
        value: 1,
      },
      {
        label: 'TODAY',
        value: todayValue,
      },
      {
        label: `STD Response Due`,
        value: stdResponseDueValue,
      },
      {
        label: 'Wedding Day!',
        value: 100,
      }
    ];
    setTimeline(dummyTimelineItems);
  }, []);


  return (
    <Box px={8} height={75}  borderTop="2px solid gold"  width={"800px"} maxWidth='3200px' sx={{overflow: "scroll"}}>
      <TimelineSlider
        defaultValue={10} step={null}
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
  width: "1000px",
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
    fontSize: 0,
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