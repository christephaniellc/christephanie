import {
  AirlineSeatLegroomExtra,
  AirlineSeatReclineExtra,
  DirectionsRun,
  DirectionsWalk,
  DownhillSkiing,
  EmojiPeople,
  FollowTheSigns,
  Hail,
  Hiking,
  Kayaking,
  Kitesurfing,
  NordicWalking,
  Paragliding,
  Rowing,
  SelfImprovement,
  Skateboarding,
  Sledding,
  Snowboarding,
  Snowshoeing,
  SportsBaseball,
  SportsGymnastics,
  SportsHandball,
  SportsMartialArts,
} from '@mui/icons-material';
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

// type StickFigureIconProps = OverridableComponent<SvgIconTypeMap<{}, "svg">> & {muiName: string}

interface StickFigureIconProps {
  fontSize?: 'inherit' | 'small' | 'large' | 'medium' | undefined;
  hidden?: boolean;
}

const StickFigureIcon = ({ fontSize = 'inherit', hidden = false }: StickFigureIconProps) => {
  const StickFigureAdults = [
    DirectionsRun,
    DirectionsWalk,
    DownhillSkiing,
    FollowTheSigns,
    Kayaking,
    Kitesurfing,
    NordicWalking,
    Rowing,
    SelfImprovement,
    Paragliding,
    SportsGymnastics,
    SportsHandball,
    SportsMartialArts,
    Snowshoeing,
    Hiking,
    EmojiPeople,
    Sledding,
    Snowboarding,
    Skateboarding,
    Hail,
    Snowshoeing,
    AirlineSeatLegroomExtra,
    AirlineSeatReclineExtra,
  ];
  const randomRotationTransformationAngle = Math.floor(Math.random() * 360);
  const RandomStickFigure = StickFigureAdults[Math.floor(Math.random() * StickFigureAdults.length)];

  return <RandomStickFigure fontSize={fontSize} sx={{ width: hidden ? 0 : 'auto',
    transform: `rotate(${randomRotationTransformationAngle}deg)`,
    transition: 'all 1s ease-in-out',
    opacity: hidden ? 0 : 1,
    visibility: hidden ? 'hidden' : 'visible'
  }}/>;

};

export default StickFigureIcon;