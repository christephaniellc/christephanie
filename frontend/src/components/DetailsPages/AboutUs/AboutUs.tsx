import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, styled, useTheme, useMediaQuery, Avatar } from '@mui/material';
import burn_night from '../../../assets/engagement-photos/burn_night.jpg';
import oktoberfest from '../../../assets/engagement-photos/oktoberfest.jpg';
import bremerhaven from '../../../assets/engagement-photos/bremerhaven.jpg';
import roadtrip from '../../../assets/engagement-photos/roadtrip.jpg';
import bm2023 from '../../../assets/engagement-photos/bm2023.jpg';
import topherAvatar from '../../../assets/engagement-photos/toph_seattle.jpg';
import stephAvatar from '../../../assets/engagement-photos/steph_car.jpg';
import kilton from '../../../assets/engagement-photos/kilton.jpg';
import laney from '../../../assets/engagement-photos/laney.jpg';

interface AboutUsProps {
  handleTabLink: (to: string) => void;
}

// Styled components
const CharacterFrame = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  borderRadius: theme.spacing(1),
  border: '2px solid #61dafb',
  color: theme.palette.common.white,
  marginBottom: theme.spacing(2),
}));

const CharacterAvatar = styled(Avatar)(({ theme }) => ({
  width: '100%',
  height: 'auto',
  aspectRatio: '1/1',
  border: '3px solid #61dafb',
  boxShadow: '0 0 10px 2px rgba(97, 218, 251, 0.5)',
}));

const ShadowAvatar = styled(Avatar)(({ theme }) => ({
  width: '100%',
  height: 'auto',
  aspectRatio: '1/1',
  backgroundColor: 'rgba(20, 20, 20, 0.9)',
  filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.2))',
  opacity: 0.6,
}));

const AttributeGrid = styled(Grid)(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

const AttributeLabel = styled(Typography)(({ theme }) => ({
  color: '#61dafb',
  fontWeight: 'bold',
}));

const AttributeValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
}));

// Define a custom interface for the SelectButton props
interface SelectButtonProps {
  isSelected?: boolean;
}

const SelectButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<SelectButtonProps>(({ theme, isSelected }) => ({
  backgroundColor: isSelected ? '#61dafb' : 'transparent',
  color: isSelected ? '#000' : '#61dafb',
  border: `2px solid ${isSelected ? '#61dafb' : 'rgba(97, 218, 251, 0.5)'}`,
  width: '100%',
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: isSelected ? '#61dafb' : 'rgba(97, 218, 251, 0.2)',
  },
}));

const CharacterBio = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  fontSize: '0.9rem',
  lineHeight: 1.5,
}));

const GamerTag = styled(Typography)(({ theme }) => ({
  fontFamily: '"Press Start 2P", cursive',
  fontSize: '0.8rem',
  color: '#FFD700',
  marginBottom: theme.spacing(1),
}));

const ShadowOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#FF5555',
  fontWeight: 'bold',
}));

const StatsBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

const ProgressBarContainer = styled(Box)(({ theme }) => ({
  height: 15,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
}));

const ProgressBar = styled(Box)<{ value: number }>(({ theme, value }) => ({
  height: '100%',
  width: `${value}%`,
  backgroundColor: '#61dafb',
  borderRadius: theme.spacing(0.5),
}));

const GameTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Press Start 2P", cursive',
  color: '#FFD700',
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
  [theme.breakpoints.up('md')]: {
    fontSize: '1.5rem',
  },
}));

const AboutUs: React.FC<AboutUsProps> = ({ handleTabLink }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedCharacter, setSelectedCharacter] = useState<'topher' | 'steph' | 'kilton' | 'laney'>('topher');

  const characters = {
    topher: {
      name: 'Topher Sikorra',
      gamerTag: 'PlannedChaos_T',
      avatar: topherAvatar,
      attributes: {
        origin: 'Florida, USA',
        class: 'Software Engineer',
        specialAbility: 'Debugging in production',
        favoriteFood: 'Pizza with Olives',
        hobbies: 'Coding, Ukelele, Snowboarding',
        alignment: 'Chaotic Good'
      },
      stats: {
        strength: 85,
        intelligence: 90,
        charisma: 85,
        organzition: 0,
        dancing: 60,
        romance: 95,
      },
      bio: `An at-large Florida Man with a passion for code and tinkering, Topher's journey began as Marine and two-time war-veteran, and soon after found himself in the aerospace world, where he honed his skills as an engineer. His quest for knowledge and new experiences took him to Mexico, Europe, and eventually Seattle, where fate would eventually introduce him to his player two. Known for his problem-solving abilities, ideation, and quick wit, Topher leveled up his life when he found Steph at Burning Man, where they connected in a Hash House Harriers camp, "BRCH3." Together they've navigated through the challenges of life's game, combining their strengths to form an unbeatable team.`,
    },
    steph: {
      name: 'Steph Stubler',
      gamerTag: 'CodeSlinger_S',
      avatar: stephAvatar,
      attributes: {
        origin: 'Virginia, USA',
        class: 'Software Engineer',
        specialAbility: 'Event planning under pressure',
        favoriteFood: 'Bratwurst',
        hobbies: 'Art, Piano, Dancing',
        alignment: 'Neutral Good'
      },
      stats: {
        strength: 85,
        intelligence: 90,
        charisma: 90,
        cooking: 75,
        dancing: 85,
        romance: 95,
      },
      bio: `With roots in DC and Virginia, and armed with an adventurous spirit, Steph's character journey led her through creative pursuits and strategic thinking. Her natural talent for bringing people together and creating memorable experiences made her a sought-after ally in any quest. When her path crossed with Topher's during a the muddiest Burning Man of all time, the chemistry was undeniable. They discovered a shared love for adventure, absurdity, long hair, and exploration that would take them from the mountains of Seattle to the streets of Germany. Through their adventures across continents, they've created a love story worthy of its own epic game saga.`,
    },
    kilton: {
      name: 'Kilton Jett',
      gamerTag: 'HandsomestMan_K',
      avatar: kilton,
      attributes: {
        origin: 'Seattle, WA',
        class: 'Food Detector',
        specialAbility: 'Racing down the stairs when a refrigerator opens',
        favoriteFood: 'Beecher\'s Cheese',
        hobbies: 'Eating cheese, moping when leaving the dog park, singing to earn pets',
        alignment: 'Lawful Good'
      },
      stats: {
        strength: 42,
        intelligence: 35,
        charisma: 47,
        cooking: 0,
        energy: 35,
        cuddling: 95,
      },
      bio: `Kilton Jett, arbiter of snuggling proximity, `,
    },
    laney: {
      name: 'Helena Josephine',
      gamerTag: 'WhiteLightning_K',
      avatar: laney,
      attributes: {
        origin: 'Seattle, WA',
        class: 'Toot Expert',
        specialAbility: 'Drive by bark hellos',
        favoriteFood: 'Her brother\'s feet',
        hobbies: 'Escaping dog park fences, disappearing and reappearing with thorns in her face',
        alignment: 'Chaotic Neutral'
      },
      stats: {
        strength: 94,
        intelligence: 35,
        charisma: 55,
        cooking: 0,
        energy: 100,
        cuddling: 28,
      },
      bio: `Laney Jo, , `,
    },
  };

  const shadowCharacters = [
    { id: 'ex1', name: 'NOT SELECTED' },
    { id: 'ex2', name: 'NOT SELECTED' },
  ];

  const selectedChar = characters[selectedCharacter];

  return (
    <Box sx={{ 
      p: 2, 
      background: 'linear-gradient(to bottom, #000000, #1a1a2e)', 
      minHeight: '100vh',
      color: 'white',
    }}>
      <GameTitle variant="h4">
        [CHARACTER SELECT]
      </GameTitle>

      <Grid container spacing={2}>
        {/* Character selection sidebar */}
        <Grid item xs={4} sm={3} md={2}>
          <SelectButton 
            isSelected={selectedCharacter === 'topher'} 
            onClick={() => setSelectedCharacter('topher')}
          >
            Player 1
          </SelectButton>
          <SelectButton 
            isSelected={selectedCharacter === 'steph'} 
            onClick={() => setSelectedCharacter('steph')}
          >
            Player 2
          </SelectButton>
          <SelectButton 
            isSelected={selectedCharacter === 'kilton'} 
            onClick={() => setSelectedCharacter('kilton')}
          >
            Player 3
          </SelectButton>
          <SelectButton 
            isSelected={selectedCharacter === 'laney'} 
            onClick={() => setSelectedCharacter('laney')}
          >
            Player 4
          </SelectButton>
          
          {/* Shadow characters (exes) */}
          {shadowCharacters.map((shadow) => (
            <Box key={shadow.id} sx={{ position: 'relative', mb: 1 }}>
              <SelectButton 
                isSelected={false} 
                onClick={() => {}}
                disabled
              >
                ???
              </SelectButton>
            </Box>
          ))}
        </Grid>

        {/* Main character profile */}
        <Grid item xs={8} sm={9} md={10}>
          <CharacterFrame>
            <Grid container spacing={2}>
              {/* Character image */}
              <Grid item xs={12} sm={4}>
                <CharacterAvatar src={selectedChar.avatar} variant="rounded" />
                <Box sx={{ mt: 1 }}>
                  <GamerTag variant="subtitle2">
                    {selectedChar.gamerTag}
                  </GamerTag>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {selectedChar.name}
                  </Typography>
                </Box>

                {/* Stats section - mobile only shows on character page */}
                {!isMobile && (
                  <StatsBox>
                    <Typography variant="subtitle2" sx={{ color: '#61dafb', mb: 1 }}>
                      CHARACTER STATS
                    </Typography>
                    {Object.entries(selectedChar.stats).map(([stat, value]) => (
                      <Box key={stat} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                            {stat}
                          </Typography>
                          <Typography variant="caption">
                            {value}/100
                          </Typography>
                        </Box>
                        <ProgressBarContainer>
                          <ProgressBar value={value} />
                        </ProgressBarContainer>
                      </Box>
                    ))}
                  </StatsBox>
                )}
              </Grid>

              {/* Character attributes & bio */}
              <Grid item xs={12} sm={8}>
                <AttributeGrid container spacing={1}>
                  {Object.entries(selectedChar.attributes).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <Grid item xs={5} sm={4}>
                        <AttributeLabel variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {key}:
                        </AttributeLabel>
                      </Grid>
                      <Grid item xs={7} sm={8}>
                        <AttributeValue variant="body2">
                          {value}
                        </AttributeValue>
                      </Grid>
                    </React.Fragment>
                  ))}
                </AttributeGrid>

                <CharacterBio>
                  {selectedChar.bio}
                </CharacterBio>

                {/* Our love story */}
                {(selectedCharacter === 'topher' || selectedCharacter === 'steph') && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ color: '#61dafb', fontWeight: 'bold', mb: 1 }}>
                    [MAIN QUEST: LOVE STORY]
                  </Typography>
                  <Typography variant="body2">
                    Their journey began beneath the stars at Burning Man in 2023, where Topher and Steph's paths converged first, despite having almost met in 2017. 
                    Topher, an avid and talented runner, and Steph, a horrendous runner but enthusiastic "try new crazy things and meet fun people"-er, were both part of the infamous running club EWH3 based in Washington, DC.
                    Hashing will have you navigate random terrains with up to hundreds of runners, and then meet up to share some beers. Sometimes, you will beer during trail.
                    Steph discovered hashing just as Topher was moving to Seattle, and so their paths would not cross then outside of a Facebook friend request in 2017.
                    Just before he moved, Topher inquired if Steph could join his team for a Ragnar race. Steph, still a terribly bad runner, declined, citing her own brother's conflicting wedding date,
                    though she was remiss, as Topher was cute.
                    Six years later, in 2023, Steph won the Burning Man ticket lottery and found herself with an extra ticket, which she sold to Topher himself through
                    their mutual friend and camp lead: Karen.
                    They finally met in August in the Black Rock City desert and were thoroughly and individually endorsed to each other through another mutual friend: Britt.
                    Steph found Topher to still be cute. They haven't stopped giggling since. 
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6} sm={3}>
                      <Avatar src={bm2023} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1' }} />
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                        Burning Man 2023 - BRCH3
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Avatar src={burn_night} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1' }} />
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                        Attending Local Burns
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Avatar src={roadtrip} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1' }} />
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                        Road Trips
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Avatar src={bremerhaven} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1' }} />
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                        European Adventure
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Avatar src={oktoberfest} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1' }} />
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                        Oktoberfest
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    After conquering life's various quests together - from navigating through Germany at Oktoberfest to roadtripping across the 
                    United States - they've decided to form a permanent party. The ultimate quest culminates on July 5, 2025, when 
                    they'll exchange legendary items (rings) at Stone Manor Inn in Lovettsville, Virginia.
                  </Typography>
                </Box>
                )}
              </Grid>
            </Grid>

            {/* Mobile stats section */}
            {isMobile && (
              <StatsBox sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#61dafb', mb: 1 }}>
                  CHARACTER STATS
                </Typography>
                {Object.entries(selectedChar.stats).map(([stat, value]) => (
                  <Box key={stat} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                        {stat}
                      </Typography>
                      <Typography variant="caption">
                        {value}/100
                      </Typography>
                    </Box>
                    <ProgressBarContainer>
                      <ProgressBar value={value} />
                    </ProgressBarContainer>
                  </Box>
                ))}
              </StatsBox>
            )}
          </CharacterFrame>

          {/* Shadow characters on larger screens */}
          {!isMobile && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#FF5555', mb: 1 }}>
                [CHARACTERS NOT SELECTED]
              </Typography>
              <Grid container spacing={2}>
                {shadowCharacters.map((shadow) => (
                  <Grid item xs={6} sm={3} key={shadow.id}>
                    <Box sx={{ position: 'relative' }}>
                      <ShadowAvatar variant="rounded" />
                      <ShadowOverlay>
                        <Typography variant="body2">NOT CHOSEN</Typography>
                      </ShadowOverlay>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutUs;