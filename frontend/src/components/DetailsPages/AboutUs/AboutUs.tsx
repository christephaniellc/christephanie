import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, styled, useTheme, useMediaQuery, Avatar } from '@mui/material';
import burn_night from '../../../assets/engagement-photos/burn_night.jpg';
import oktoberfest from '../../../assets/engagement-photos/oktoberfest.jpg';
import bremerhaven from '../../../assets/engagement-photos/bremerhaven.jpg';
import roadtrip from '../../../assets/engagement-photos/roadtrip.jpg';

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
  const [selectedCharacter, setSelectedCharacter] = useState<'topher' | 'steph'>('topher');

  const characters = {
    topher: {
      name: 'Topher Sikorra',
      gamerTag: 'CodeSlinger_T',
      avatar: oktoberfest,
      attributes: {
        origin: 'California, USA',
        class: 'Software Developer',
        specialAbility: 'Debugging in production',
        favoriteFood: 'Tacos',
        hobbies: 'Coding, Burning Man, Travel',
      },
      stats: {
        strength: 75,
        intelligence: 90,
        charisma: 85,
        cooking: 65,
        dancing: 60,
        romance: 95,
      },
      bio: `A California native with a passion for code and adventure, Topher's journey began in the tech world where he honed his skills as a software developer. His quest for knowledge and new experiences took him across Europe, where fate would eventually introduce him to his player two. Known for his problem-solving abilities and quick wit, Topher leveled up his life when he found Steph at Burning Man, where they connected under the stars on a dusty playa night. Together they've navigated through the challenges of life's game, combining their strengths to form an unbeatable team.`,
    },
    steph: {
      name: 'Steph Stubler',
      gamerTag: 'PlannedChaos_S',
      avatar: burn_night,
      attributes: {
        origin: 'Maine, USA',
        class: 'Creative Strategist',
        specialAbility: 'Event planning under pressure',
        favoriteFood: 'Thai cuisine',
        hobbies: 'Art, Travel, Dancing',
      },
      stats: {
        strength: 70,
        intelligence: 88,
        charisma: 90,
        cooking: 75,
        dancing: 85,
        romance: 95,
      },
      bio: `With roots in Maine and an adventurous spirit, Steph's character journey led her through creative pursuits and strategic thinking. Her natural talent for bringing people together and creating memorable experiences made her a sought-after ally in any quest. When her path crossed with Topher's during a magical night at Burning Man, the chemistry was undeniable. They discovered a shared love for adventure, travel, and exploration that would take them from the beaches of California to the streets of Germany. Through their adventures across continents and cultural experiences, they've created a love story worthy of its own epic game saga.`,
    },
  };

  // Shadow characters representing "exes"
  const shadowCharacters = [
    { id: 'ex1', name: 'NOT SELECTED' },
    { id: 'ex2', name: 'NOT SELECTED' },
    { id: 'ex3', name: 'NOT SELECTED' },
    { id: 'ex4', name: 'NOT SELECTED' },
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
            P1
          </SelectButton>
          <SelectButton 
            isSelected={selectedCharacter === 'steph'} 
            onClick={() => setSelectedCharacter('steph')}
          >
            P2
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
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ color: '#61dafb', fontWeight: 'bold', mb: 1 }}>
                    [MAIN QUEST: LOVE STORY]
                  </Typography>
                  <Typography variant="body2">
                    Their journey began beneath the stars at Burning Man in 2018, where Topher and Steph's paths converged during burn night. 
                    What started as a chance encounter evolved into a deep connection as they discovered shared passions for adventure, travel, and creativity.
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6} sm={3}>
                      <Avatar src={burn_night} variant="rounded" sx={{ width: '100%', height: 'auto', aspectRatio: '1/1' }} />
                      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                        First Meeting
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