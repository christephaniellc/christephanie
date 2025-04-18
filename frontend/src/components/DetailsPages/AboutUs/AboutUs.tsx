import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, styled, useTheme, useMediaQuery, Avatar, alpha } from '@mui/material';
import burn_night from '../../../assets/engagement-photos/burn_night.jpg';
import oktoberfest from '../../../assets/engagement-photos/oktoberfest.jpg';
import bremerhaven from '../../../assets/engagement-photos/bremerhaven.jpg';
import roadtrip from '../../../assets/engagement-photos/roadtrip.jpg';
import bm2023 from '../../../assets/engagement-photos/bm2023.jpg';
import topherAvatar from '../../../assets/engagement-photos/toph.jpg';
import stephAvatar from '../../../assets/engagement-photos/steph_car.jpg';
import kilton from '../../../assets/engagement-photos/kilton.jpg';
import laney from '../../../assets/engagement-photos/laney.jpg';
import rattlesnake1 from '../../../assets/engagement-photos/topher_and_steph_rsvp1.jpg';
import { StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

interface AboutUsProps {
  handleTabLink: (to: string) => void;
}

// Styled components with responsive design
const CharacterFrame = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  borderRadius: theme.spacing(1),
  border: `2px solid ${theme.palette.secondary.dark}`,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(0.75),
    border: `1px solid ${theme.palette.secondary.dark}`,
    marginBottom: theme.spacing(1.5),
  }
}));

const CharacterAvatar = styled(Avatar)(({ theme }) => ({
  width: '100%',
  height: 'auto',
  aspectRatio: '1/1',
  border: `3px solid ${theme.palette.secondary.main}`,
  boxShadow: `0 0 10px 2px ${theme.palette.primary.dark}`,
  [theme.breakpoints.down('sm')]: {
    border: `2px solid ${theme.palette.secondary.main}`,
    boxShadow: `0 0 6px 1px ${theme.palette.primary.dark}`,
  }
}));

const AttributeGrid = styled(Grid)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(1),
    gap: theme.spacing(0.5),
  }
}));

const AttributeLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.light,
  fontWeight: 'bold',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const AttributeValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

// Define a custom interface for the SelectButton props
interface SelectButtonProps {
  isSelected?: boolean;
}

const SelectButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<SelectButtonProps>(({ theme, isSelected }) => ({
  backgroundColor: isSelected ? theme.palette.secondary.main : 'transparent',
  color: isSelected ? '#000' : theme.palette.secondary.main,
  border: `2px solid ${isSelected ? theme.palette.secondary.main : theme.palette.secondary.dark}`,
  width: '100%',
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: isSelected ? theme.palette.secondary.main : theme.palette.secondary.light,
    color: '#000'
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    padding: theme.spacing(0.5, 1),
    marginBottom: theme.spacing(0.75),
    border: `1px solid ${isSelected ? theme.palette.secondary.main : theme.palette.secondary.dark}`,
  }
}));

const CharacterBio = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  fontSize: '0.9rem',
  lineHeight: 1.5,
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1.5),
    fontSize: '0.75rem',
    lineHeight: 1.4,
  }
}));

const GamerTag = styled(Typography)(({ theme }) => ({
  fontFamily: '"Press Start 2P", cursive',
  fontSize: '0.8rem',
  color: theme.palette.secondary.light,
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.6rem',
    marginBottom: theme.spacing(0.5),
  }
}));

const StatsBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75),
    borderRadius: theme.spacing(0.25),
    marginTop: theme.spacing(0.75),
  }
}));

const ProgressBarContainer = styled(Box)(({ theme }) => ({
  height: 15,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    height: 12,
    borderRadius: theme.spacing(0.25),
    marginBottom: theme.spacing(0.25),
  }
}));

const ProgressBar = styled(Box)<{ value: number }>(({ theme, value }) => ({
  height: '100%',
  width: `${value}%`,
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(0.25),
  }
}));

const AboutUs: React.FC<AboutUsProps> = ({ handleTabLink }) => {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedCharacter, setSelectedCharacter] = useState<'topher' | 'steph' | 'kilton' | 'laney'>('topher');

  const characters = {
    topher: {
      name: 'Topher Sikorra',
      gamerTag: 'VelociCrafter_23',
      avatar: topherAvatar,
      attributes: {
        origin: 'Florida, USA',
        class: 'Senior Software Engineer',
        specialAbility: 'Debugging in production',
        favoriteFood: 'Pizza with Olives',
        hobbies: 'Coding, Ukelele, Snowboarding',
        alignment: 'Chaotic Good'
      },
      stats: {
        jolliness: 95,
        creativity: 97,
        organization: 2.5,
        thoughtfulness: 95,
      },
      bio: `An at-large Florida Man with a passion for code and tinkering, 
      Topher's journey began as a Marine and two-time war-veteran. As an amphibious vehicle mechanic in the military, 
      he discovered a serious knack for handling complex systems. This easily translated into becoming an aerospace engineer, 
      which ultimately led him to the world of software. 
      <br/><br/>
      His entrepreneurial experiences took him to Mexico, Europe, and eventually Seattle, where fate would eventually introduce him to his player two. 
      Known for his problem-solving abilities, wild and sometimes practical ideation, quick wit, and the 80 of 80/20 project starts, Topher "leveled up" when he 
      discovered Steph, who is a hardcore 20 finisher. With their powers combined, they make a formidable team.`, 
    },
    steph: {
      name: 'Steph Stubler',
      gamerTag: 'WholeAss_22',
      avatar: stephAvatar,
      attributes: {
        origin: 'Virginia, USA',
        class: 'Staff Software Engineer and Team Lead',
        specialAbility: 'Rubik\'s Cube solving',
        favoriteFood: 'Bratwurst',
        hobbies: 'Art, Piano, Dubstep Shows',
        alignment: 'Neutral Good'
      },
      stats: {
        curiosity: 92,
        tenacity: 95,
        running: 3.9,
        bowling: 15
      },
      bio: `With roots in DC, Virginia, and northern Germany, armed with an adventurous spirit, Steph's preoccupation for learning has earned her several skills of 
      varying usefulness, including: rolling a kayak underwater four to five times in succession for no reason, reproducing an almost-exact Taco Bell meat texture on the stovetop, 
      and tetris-ing far too much camping gear into tiny car trunks. Steph is a hardcore camper/"glamper" and earned her burn name, "Whole Ass," for not half-assing, 
      well, anything. 
      <br/><br/>When her path crossed with Topher's during the muddiest Burning Man of all time, the chemistry was undeniable. Topher demo'd his custom 
      "Breadth of the Wild" Zelda quest-and-item tracking website to her on their first interaction, and her completionist heart was won over, immediately.
      <br/><br/>
      They have since discovered a shared love for absurdity, long hair, learning, and exploration that would take them from the streets of DC, to the 
      mountains of Seattle, to the beer halls of Germany.`,
    },
    kilton: {
      name: 'Kilton Jett Sikorra',
      gamerTag: 'HandsomestMan_20',
      avatar: kilton,
      attributes: {
        origin: 'Seattle, WA',
        class: 'Food Detector',
        specialAbility: 'Racing down the stairs when a refrigerator opens',
        favoriteFood: 'Beecher\'s Cheese',
        hobbies: 'Moping when leaving the dog park, singing to earn pets and treats',
        alignment: 'Lawful Good'
      },
      stats: {
        enthusiasm: 47,
        cuddling: 95,
        energy: 35,
        prancing: 78
      },
      bio: `Kilton Jett, our caroling man, knows exactly when any snack is being consumed, 
      and will sing in husky-mix fashion to alert the snacker to his presence. In his estimation, he totally deserves this food, obviously for being so handsome. 
      <br/><br/>
      Most morose when it is time to leave the park, Kilton will slow his gait to an almost backwards pace, as he approaches the exit. 
      <br/><br/>
      At home, you will often find Kilton's snoot hanging out of an open window while perched in his favorite armchair, 
      positioned perfectly to alert house residents of dangerous raccoons and evil mail-people. 
      <br/><br/>
      Shy until he has determined his liking to you, once in his favor, Kilton will ensure you stay on 
      task by snuggling his head on your hip while you are working on the couch. 
      <br/><br/>
      Kilton will loyally verify you are nearby at all times on walks, and tolerates being picked up...although his face may display abject horror.`,
    },
    laney: {
      name: 'Helena Josephine Sikorra',
      gamerTag: 'WhiteLightning_21',
      avatar: laney,
      attributes: {
        origin: 'Seattle, WA',
        class: 'Toot Expert',
        specialAbility: 'Drive-by bark hellos',
        favoriteFood: 'Her brother\'s feet',
        hobbies: 'Disappearing and reappearing with thorns in her face',
        alignment: 'Chaotic Neutral'
      },
      stats: {
        muscleDefinition: 94,
        willfullness: 83,
        commandResponseTime: 28,
        energy: 100,
      },
      bio: `Helena Josephine (Laney Jo), facilitator of pandemonium, will find the only Laney-Jo-sized hole in a fence to break free of the horrific jail 
      of any glorious Seattle dog park, in order to hunt small non-dog creatures. 
      <br/><br/>
      Extroverted outdoors, no dog is too large nor intimidating to escape a gruff bark-growl greeting.
      Indoors, however, this chaos dog will slink away deep into blankety caves and custom teepees to ponder life's complexities. 
      <br/><br/>
      Professional face-licker with race-horse speed, she will gleefully bound away with little regard for her own safety, particularly in urban environments. 
      <br/><br/>
      The size and density of her doggy muscles make her more of a sinker in lakes than swimmer, although occasionally she can be found terrorizing 
      other creatures wearing a pink shark life-vest.`,
    },
  };

  const shadowCharacters = [
    { id: 'ex1', name: 'NOT SELECTED' },
    { id: 'ex2', name: 'NOT SELECTED' },
  ];

  const selectedChar = characters[selectedCharacter];

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2 }, 
      background: 'linear-gradient(to bottom, #000000, #1a1a2e)', 
      color: 'white',
      height: 'auto',
      minHeight: 'fit-content',
      width: '100%',
      overflow: 'visible',
      paddingBottom: { xs: '100px', sm: '60px' }, // Extra padding at bottom for mobile
    }}>
      {/* Title section - made responsive for mobile */}
      <Box>
        <StephsActualFavoriteTypographyNoDrop 
          sx={{
            textAlign: 'center',
            fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
            mb: { xs: 1, sm: 2 }
          }}
        >
          [CHARACTER SELECT]
        </StephsActualFavoriteTypographyNoDrop>
      </Box>
      
      {/* Mobile-only horizontal player selection buttons */}
      {isMobile && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 0.5,
          mb: 2,
          mt: 1
        }}>
          <SelectButton 
            isSelected={selectedCharacter === 'topher'} 
            onClick={() => setSelectedCharacter('topher')}
            sx={{
              fontSize: '0.65rem',
              py: 0.5,
              px: 0.5,
              borderRadius: 1,
              flex: 1,
              minWidth: 0,
              mb: 0
            }}
          >
            P1
          </SelectButton>
          <SelectButton 
            isSelected={selectedCharacter === 'steph'} 
            onClick={() => setSelectedCharacter('steph')}
            sx={{
              fontSize: '0.65rem',
              py: 0.5,
              px: 0.5,
              borderRadius: 1,
              flex: 1,
              minWidth: 0,
              mb: 0
            }}
          >
            P2
          </SelectButton>
          <SelectButton 
            isSelected={selectedCharacter === 'kilton'} 
            onClick={() => setSelectedCharacter('kilton')}
            sx={{
              fontSize: '0.65rem',
              py: 0.5,
              px: 0.5,
              borderRadius: 1,
              flex: 1,
              minWidth: 0,
              mb: 0
            }}
          >
            P3
          </SelectButton>
          <SelectButton 
            isSelected={selectedCharacter === 'laney'} 
            onClick={() => setSelectedCharacter('laney')}
            sx={{
              fontSize: '0.65rem',
              py: 0.5,
              px: 0.5,
              borderRadius: 1,
              flex: 1, 
              minWidth: 0,
              mb: 0
            }}
          >
            P4
          </SelectButton>
        </Box>
      )}
      
      {/* Main content grid */}
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {/* Character selection sidebar - desktop only */}
        {!isMobile && (
          <Grid item sm={3} md={2}>
            <SelectButton 
              isSelected={selectedCharacter === 'topher'} 
              onClick={() => setSelectedCharacter('topher')}
              sx={{
                fontSize: '0.85rem',
                py: 1
              }}
            >
              Player 1
            </SelectButton>
            <SelectButton 
              isSelected={selectedCharacter === 'steph'} 
              onClick={() => setSelectedCharacter('steph')}
              sx={{
                fontSize: '0.85rem',
                py: 1
              }}
            >
              Player 2
            </SelectButton>
            <SelectButton 
              isSelected={selectedCharacter === 'kilton'} 
              onClick={() => setSelectedCharacter('kilton')}
              sx={{
                fontSize: '0.85rem',
                py: 1
              }}
            >
              Player 3
            </SelectButton>
            <SelectButton 
              isSelected={selectedCharacter === 'laney'} 
              onClick={() => setSelectedCharacter('laney')}
              sx={{
                fontSize: '0.85rem',
                py: 1
              }}
            >
              Player 4
            </SelectButton>          
          </Grid>
        )}

        {/* Main character profile - full width on mobile */}
        <Grid item xs={12} sm={9} md={10}>
          <CharacterFrame sx={{ 
            p: { xs: 1.5, sm: 2 }
          }}>
            {/* Mobile optimized layout */}
            {isMobile ? (
              <>
                {/* Mobile character header */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  mb: 2
                }}>
                  <CharacterAvatar 
                    src={selectedChar.avatar} 
                    variant="rounded"
                    sx={{
                      borderWidth: 2,
                      width: '40%',
                      maxWidth: '150px'
                    }}
                  />
                  <Box>
                    <GamerTag 
                      variant="subtitle2"
                      sx={{
                        fontSize: '0.6rem',
                        mb: 0.5
                      }}
                    >
                      {selectedChar.gamerTag}
                    </GamerTag>
                    <Typography 
                      variant="h6" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}
                    >
                      {selectedChar.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Mobile attributes */}
                <AttributeGrid 
                  container 
                  spacing={1}
                  sx={{ pt: 0, mb: 2 }}
                >
                  {Object.entries(selectedChar.attributes).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <Grid item xs={5}>
                        <AttributeLabel 
                          variant="body2" 
                          sx={{ 
                            textTransform: 'capitalize',
                            fontSize: '0.75rem'
                          }}
                        >
                          {key}:
                        </AttributeLabel>
                      </Grid>
                      <Grid item xs={7}>
                        <AttributeValue 
                          variant="body2"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {value}
                        </AttributeValue>
                      </Grid>
                    </React.Fragment>
                  ))}
                </AttributeGrid>

                {/* Mobile stats */}
                <StatsBox sx={{ 
                  mb: 2,
                  p: 1.5,
                  borderRadius: 1
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: theme.palette.secondary.light, 
                      mb: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    CHARACTER STATS
                  </Typography>
                  {Object.entries(selectedChar.stats).map(([stat, value]) => (
                    <Box key={stat} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            textTransform: 'capitalize',
                            fontSize: '0.7rem'
                          }}
                        >
                          {stat}
                        </Typography>
                        <Typography 
                          variant="caption"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {value}/100
                        </Typography>
                      </Box>
                      <ProgressBarContainer sx={{ height: 12 }}>
                        <ProgressBar value={value} />
                      </ProgressBarContainer>
                    </Box>
                  ))}
                </StatsBox>

                {/* Mobile bio */}
                <CharacterBio sx={{ 
                  fontSize: '0.75rem',
                  mt: 0,
                  mb: 2,                  
                }}>
                  <Typography
                    dangerouslySetInnerHTML={{ __html: selectedChar.bio }}>
                  </Typography>
                </CharacterBio>

                {/* Mobile love story */}
                {(selectedCharacter === 'topher' || selectedCharacter === 'steph') && (
                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.primary.light, 
                      fontWeight: 'bold', 
                      mb: 1,
                      fontSize: '1rem'
                    }}
                  >
                    [MAIN QUEST: LOVE STORY]
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{
                      fontSize: '0.75rem',
                      lineHeight: 1.4
                    }}
                  >
                    A tale as old as time: 
                    girl wins Burning Man ticket lottery, 
                    girl sells extra ticket to boy, 
                    boy and girl meet at Burning Man camp, 
                    girl thinks boy is cute,
                    girl visits boy in and moves to Seattle, 
                    girl inherits two dogs of boy, 
                    boy proposes in a camping tent.
                    <br/><br/>
                      Topher and Steph have been Facebook friends since 2017, thanks to a DC-based social running club, the "Hash House Harriers." 
                      <br/>Versions of this club exist all over the world: "hashers" meet up weekly to run, following a chalk-marked trail, occasionally stopping at "check" points to 
                      consume a beer or two, and probably sing offensive songs.
                      <br/><br/>
                      Topher, an avid and talented runner, and Steph, a horrendous runner, but enthusiastic "try new outrageous things and meet fun people"-er, were both members of this rather infamous community.
                      Steph discovered hashing in 2016 just as Topher was moving to Seattle, and so their paths would not cross officially until seven years later.
                      
                      <br/><br/>Topher and Steph finally meet in August of 2023, in the Black Rock City desert, and were thoroughly and enthusiastically endorsed to each other, by several mutual and gushing friends.
                      As two software engineers who adore problem-solving and code, they found compatibilities everywhere from life goals, general outlooks, and proper toilet-paper orientation (over, you heathens).
                        
                      <br/><br/>They haven't stopped giggling since.
                      <br/>...especially while building this website.  
                  </Typography>
                  
                  {/* Mobile photo grid - 2 columns */}
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Avatar 
                        src={bm2023} 
                        variant="rounded" 
                        sx={{ 
                          width: '100%', 
                          height: 'auto', 
                          aspectRatio: '1/1',
                          borderRadius: '6px'
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 0.5, 
                          color: theme.palette.secondary.main,
                          fontSize: '0.6rem'
                        }}
                      >
                        Burning Man 2023
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Avatar 
                        src={roadtrip} 
                        variant="rounded" 
                        sx={{ 
                          width: '100%', 
                          height: 'auto', 
                          aspectRatio: '1/1',
                          borderRadius: '6px'
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 0.5, 
                          color: theme.palette.secondary.main,
                          fontSize: '0.6rem'
                        }}
                      >
                        Road Trip
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Avatar 
                        src={burn_night} 
                        variant="rounded" 
                        sx={{ 
                          width: '100%', 
                          height: 'auto', 
                          aspectRatio: '1/1',
                          borderRadius: '6px'
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 0.5, 
                          color: theme.palette.secondary.main,
                          fontSize: '0.6rem'
                        }}
                      >
                        Local Burns
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Avatar 
                        src={bremerhaven} 
                        variant="rounded" 
                        sx={{ 
                          width: '100%', 
                          height: 'auto', 
                          aspectRatio: '1/1',
                          borderRadius: '6px'
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 0.5, 
                          color: theme.palette.secondary.main,
                          fontSize: '0.6rem'
                        }}
                      >
                        Bremerhaven
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Avatar 
                        src={oktoberfest} 
                        variant="rounded" 
                        sx={{ 
                          width: '100%', 
                          height: 'auto', 
                          aspectRatio: '1/1',
                          borderRadius: '6px'
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 0.5, 
                          color: theme.palette.secondary.main,
                          fontSize: '0.6rem'
                        }}
                      >
                        Oktoberfest 2024
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Avatar 
                        src={rattlesnake1} 
                        variant="rounded" 
                        sx={{ 
                          width: '100%', 
                          height: 'auto', 
                          aspectRatio: '1/1',
                          borderRadius: '6px'
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 0.5, 
                          color: theme.palette.secondary.main,
                          fontSize: '0.6rem'
                        }}
                      >
                        Seattle, WA
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                )}
              </>
            ) : (
              // Desktop layout - keep as is
              <Grid container spacing={2}>
                {/* Character image */}
                <Grid item sm={4}>
                  <CharacterAvatar 
                    src={selectedChar.avatar} 
                    variant="rounded"
                    sx={{
                      borderWidth: 3 
                    }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <GamerTag 
                      variant="subtitle2"
                      sx={{
                        fontSize: '0.8rem'
                      }}
                    >
                      {selectedChar.gamerTag}
                    </GamerTag>
                    <Typography 
                      variant="h5" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '1.5rem'
                      }}
                    >
                      {selectedChar.name}
                    </Typography>
                  </Box>

                  {/* Stats section - desktop */}
                  <StatsBox>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.palette.secondary.light, 
                        mb: 1,
                        fontSize: '0.8rem'
                      }}
                    >
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
                </Grid>

                {/* Character attributes & bio */}
                <Grid item sm={8}>
                  <AttributeGrid 
                    container 
                    spacing={1}
                    sx={{
                      pt: 2
                    }}
                  >
                    {Object.entries(selectedChar.attributes).map(([key, value]) => (
                      <React.Fragment key={key}>
                        <Grid item sm={4}>
                          <AttributeLabel 
                            variant="body2" 
                            sx={{ 
                              textTransform: 'capitalize',
                              fontSize: '0.85rem'
                            }}
                          >
                            {key}:
                          </AttributeLabel>
                        </Grid>
                        <Grid item sm={8}>
                          <AttributeValue 
                            variant="body2"
                            sx={{
                              fontSize: '0.85rem'
                            }}
                          >
                            {value}
                          </AttributeValue>
                        </Grid>
                      </React.Fragment>
                    ))}
                  </AttributeGrid>

                  <CharacterBio sx={{ 
                    fontSize: '0.85rem',
                    mt: 2
                  }}>
                    <Typography
                      sx= {{ 
                        fontSize: '0.85rem',
                      }}
                      dangerouslySetInnerHTML={{ __html: selectedChar.bio }}>
                    </Typography>
                  </CharacterBio>

                  {/* Our love story - desktop */}
                  {(selectedCharacter === 'topher' || selectedCharacter === 'steph') && (
                  <Box sx={{ mt: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: theme.palette.primary.light, 
                        fontWeight: 'bold', 
                        mb: 1,
                        fontSize: '1.25rem'
                      }}
                    >
                      [MAIN QUEST: LOVE STORY]
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{
                        fontSize: '0.85rem',
                        lineHeight: 1.5
                      }}
                    >  
                      <Paper sx={{ 
                        mt: 2,
                        p: { xs: 1, sm: 1.5 },
                        backgroundColor: alpha(theme.palette.background.paper, 0.15),
                        backdropFilter: 'blur(10px)',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
                        borderRadius: '8px',
                      }}>                   
                        <b>TLDR;</b>
                        <br/><br/>
                        <i><b>A tale as old as time:</b></i>
                        <br/>girl wins Burning Man ticket lottery, 
                        <br/>girl sells extra ticket to boy, 
                        <br/>boy and girl meet at Burning Man camp, 
                        <br/>girl thinks boy is cute,
                        <br/>girl visits boy in (and eventually moves to) Seattle, 
                        <br/>girl inherits two dogs of boy, 
                        <br/>boy proposes in a camping tent.
                      </Paper>
                    
                      <br/>
                      Topher and Steph have been Facebook friends since 2017, thanks to a DC-based social running club, the "Hash House Harriers." 
                      <br/>Versions of this club exist all over the world: "hashers" meet up weekly to run, following a chalk-marked trail, occasionally stopping at "check" points to 
                      consume a beer or two, and probably sing offensive songs.
                      <br/><br/>
                      Topher, an avid and talented runner, and Steph, a horrendous runner, but enthusiastic "try new outrageous things and meet fun people"-er, were both members of this rather infamous community.
                      Steph discovered hashing in 2016 just as Topher was moving to Seattle, and so their paths would not cross officially until seven years later.
                      
                      <br/><br/>Topher and Steph finally meet in August of 2023, in the Black Rock City desert, and were thoroughly and enthusiastically endorsed to each other, by several mutual and gushing friends.
                      As two software engineers who adore problem-solving and code, they found compatibilities everywhere from life goals, general outlooks, and proper toilet-paper orientation (over, you heathens).
                        
                      <br/><br/>They haven't stopped giggling since.
                      <br/>...especially while building this website. 
                    </Typography>
                    
                    {/* Desktop photo grid - 3x2 grid with larger images */}
                    <Box 
                      sx={{ 
                        mt: 2,
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                        borderRadius: '10px',
                        padding: 2,
                        backgroundColor: alpha('#000', 0.3)
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: theme.palette.secondary.main,
                          fontWeight: 'bold',
                          mb: 1.5,
                          textAlign: 'center'
                        }}
                      >
                        PHOTO ALBUM
                      </Typography>
                      <Grid container spacing={2}>
                        {/* Row 1 */}
                        <Grid item sm={4}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar 
                              src={bm2023} 
                              variant="rounded" 
                              sx={{ 
                                width: '100%', 
                                height: 'auto', 
                                aspectRatio: '1/1',
                                borderRadius: '10px',
                                border: `2px solid ${alpha(theme.palette.secondary.dark, 0.7)}`,
                                boxShadow: `0 4px 8px ${alpha('#000', 0.5)}`,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.03)'
                                }
                              }} 
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                textAlign: 'center', 
                                mt: 1, 
                                mb: 1,
                                color: theme.palette.secondary.main,
                                fontSize: '0.8rem',
                                fontWeight: 'medium'
                              }}
                            >
                              Burning Man 2023 - BRCH3 Camp
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item sm={4}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar 
                              src={roadtrip} 
                              variant="rounded" 
                              sx={{ 
                                width: '100%', 
                                height: 'auto', 
                                aspectRatio: '1/1',
                                borderRadius: '10px',
                                border: `2px solid ${alpha(theme.palette.secondary.dark, 0.7)}`,
                                boxShadow: `0 4px 8px ${alpha('#000', 0.5)}`,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.03)'
                                }
                              }} 
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                textAlign: 'center', 
                                mt: 1, 
                                mb: 1,
                                color: theme.palette.secondary.main,
                                fontSize: '0.8rem',
                                fontWeight: 'medium'
                              }}
                            >
                              Cross-Country Road Trip
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item sm={4}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar 
                              src={burn_night} 
                              variant="rounded" 
                              sx={{ 
                                width: '100%', 
                                height: 'auto', 
                                aspectRatio: '1/1',
                                borderRadius: '10px',
                                border: `2px solid ${alpha(theme.palette.secondary.dark, 0.7)}`,
                                boxShadow: `0 4px 8px ${alpha('#000', 0.5)}`,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.03)'
                                }
                              }} 
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                textAlign: 'center', 
                                mt: 1, 
                                mb: 1,
                                color: theme.palette.secondary.main,
                                fontSize: '0.8rem',
                                fontWeight: 'medium'
                              }}
                            >
                              Local Burn Events
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {/* Row 2 */}
                        <Grid item sm={4}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar 
                              src={bremerhaven} 
                              variant="rounded" 
                              sx={{ 
                                width: '100%', 
                                height: 'auto', 
                                aspectRatio: '1/1',
                                borderRadius: '10px',
                                border: `2px solid ${alpha(theme.palette.secondary.dark, 0.7)}`,
                                boxShadow: `0 4px 8px ${alpha('#000', 0.5)}`,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.03)'
                                }
                              }} 
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                textAlign: 'center', 
                                mt: 1, 
                                mb: 1,
                                color: theme.palette.secondary.main,
                                fontSize: '0.8rem',
                                fontWeight: 'medium'
                              }}
                            >
                              Bremerhaven, Germany
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item sm={4}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar 
                              src={oktoberfest} 
                              variant="rounded" 
                              sx={{ 
                                width: '100%', 
                                height: 'auto', 
                                aspectRatio: '1/1',
                                borderRadius: '10px',
                                border: `2px solid ${alpha(theme.palette.secondary.dark, 0.7)}`,
                                boxShadow: `0 4px 8px ${alpha('#000', 0.5)}`,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.03)'
                                }
                              }} 
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                textAlign: 'center', 
                                mt: 1, 
                                mb: 1,
                                color: theme.palette.secondary.main,
                                fontSize: '0.8rem',
                                fontWeight: 'medium'
                              }}
                            >
                              Oktoberfest 2024
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item sm={4}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar 
                              src={rattlesnake1} 
                              variant="rounded" 
                              sx={{ 
                                width: '100%', 
                                height: 'auto', 
                                aspectRatio: '1/1',
                                borderRadius: '10px',
                                border: `2px solid ${alpha(theme.palette.secondary.dark, 0.7)}`,
                                boxShadow: `0 4px 8px ${alpha('#000', 0.5)}`,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.03)'
                                }
                              }} 
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                textAlign: 'center', 
                                mt: 1, 
                                mb: 1,
                                color: theme.palette.secondary.main,
                                fontSize: '0.8rem',
                                fontWeight: 'medium'
                              }}
                            >
                              Seattle, WA
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </CharacterFrame>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutUs;