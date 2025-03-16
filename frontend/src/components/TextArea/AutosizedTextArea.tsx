import * as React from 'react';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled, keyframes, darken } from '@mui/system';
import { 
  FormControl, FormLabel, Button, Box, CircularProgress, 
  Typography, Card, useTheme, Fade, Zoom, Paper, 
  Tooltip, IconButton
} from '@mui/material';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { ApiError } from '@/api/Api';
import { useRecoilState } from 'recoil';
import { userCommentState } from '@/store/userComment/userComment';
import { useFamily } from '@/store/family';
import { FamilyUnitDto } from '@/types/api';
import { useEffect, useState, useRef } from 'react';
import { StephsActualFavoriteTypography } from '../AttendanceButton/AttendanceButton';
import SendIcon from '@mui/icons-material/Send';
import CelebrationIcon from '@mui/icons-material/Celebration';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import TvSnow from '@/components/MtvAnimatedTitle/TvSnow';
import { rem } from 'polished';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { MoodBad, SentimentDissatisfied } from '@mui/icons-material';

// Common emojis for a wedding context
const WEDDING_EMOJIS = ['❤️', '💍', '🎉', '🥂', '🍰', '💐', '🕊️', '✨', '🎊', '👰', '🤵', '🎵', '🏔️', '🏕️', '🌲'];

// Animations
const pulseEffect = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const glowEffect = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(233, 149, 12, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(233, 149, 12, 0.8), 0 0 30px rgba(233, 149, 12, 0.5);
  }
  100% {
    box-shadow: 0 0 5px rgba(233, 149, 12, 0.5);
  }
`;

const talkingAnimation = keyframes`
  0%, 100% { 
    transform: scaleY(1); 
  }
  50% { 
    transform: scaleY(0.85);
  }
`;

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const emojiFloat = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-80px) rotate(359deg);
    opacity: 0;
  }
`;

export default function AutosizedTextArea() {
  const [comment, setComment] = useRecoilState(userCommentState);
  const [family, familyActions] = useFamily();
  const theme = useTheme();
  const { boxShadow, handleMouseMove } = useBoxShadow();
  const [showEmojis, setShowEmojis] = useState(false);
  const [celebrationMode, setCelebrationMode] = useState(false);
  const [activeCelebrationEmojis, setActiveCelebrationEmojis] = useState([]);
  const [showSnow, setShowSnow] = useState(false);
  const textareaRef = useRef(null);
  const mouthOpenIcons = [SentimentVerySatisfiedIcon, MoodBad, SentimentDissatisfied];
  const RandomIcon = mouthOpenIcons[Math.floor(Math.random() * mouthOpenIcons.length)];


  // Create random emoji positions for celebration
  const createRandomEmojis = () => {
    const emojis = [];
    const count = Math.floor(Math.random() * 5) + 8; // 8-12 emojis
    
    for (let i = 0; i < count; i++) {
      emojis.push({
        emoji: WEDDING_EMOJIS[Math.floor(Math.random() * WEDDING_EMOJIS.length)],
        left: `${Math.random() * 80 + 10}%`, // 10-90%
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random() * 3}s`, // 2-5s
      });
    }
    
    return emojis;
  };

  // Reset for animation effects
  useEffect(() => {
    familyActions.patchFamilyMutation.reset();
  }, [comment]);

  // Load saved comment
  useEffect(() => {
    if (family?.invitationResponseNotes) {
      setComment(family.invitationResponseNotes);
    }
  }, [family, setComment]);

  const mutationState: UseMutationResult<FamilyUnitDto, ApiError> =
    familyActions.patchFamilyMutation;
    
  // Handler to invoke the query and celebration
  const handleSend = () => {
    familyActions.updateFamilyComment(comment);
    setShowSnow(true);
    
    // Delay before showing celebration
    setTimeout(() => {
      setCelebrationMode(true);
      setActiveCelebrationEmojis(createRandomEmojis());
      
      // Stop snow effect after a moment
      setTimeout(() => {
        setShowSnow(false);
      }, 1000);
      
      // Stop celebration after a moment
      setTimeout(() => {
        setCelebrationMode(false);
      }, 5000);
    }, 500);
  };

  // Insert emoji into textarea at cursor position
  const insertEmoji = (emoji) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    setComment(comment.substring(0, start) + emoji + comment.substring(end));
    
    // Reset focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + emoji.length;
      textarea.selectionEnd = start + emoji.length;
    }, 0);
  };

  const isFetching = mutationState.status === 'pending';
  const isSuccess = mutationState.status === 'success';
  const isError = mutationState.status === 'error';
  const isIdle = mutationState.status === 'idle';
  const error = mutationState.error;
  const isUnchanged = family?.invitationResponseNotes === comment;
  const data = mutationState.data;

  // Generate prompt ideas for user suggestions
  const promptIdeas = [
    "Can't wait to celebrate with you!",
    "Any song requests for the DJ?",
    "Dietary preferences we should know?",
    "Looking forward to dancing the night away!",
    "Excited to see the beautiful venue!",
  ];

  const getRandomPrompt = () => promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
  const [promptSuggestion, setPromptSuggestion] = useState(getRandomPrompt());
  const [showOpenMouth, setShowOpenMouth] = useState(false);
  const typingTimeoutRef = useRef(null);
  const mouthToggleRef = useRef(null);

  // Handle mouth animation sequences
  const animateMouth = () => {
    // Clear any existing animations
    if (mouthToggleRef.current) {
      mouthToggleRef.current.forEach(clearTimeout);
    }
    
    // Create a random sequence of mouth open/close timings
    const toggleSequence = [];
    const toggleCount = 3 + Math.floor(Math.random() * 3); // 3-5 toggles
    
    for (let i = 0; i < toggleCount; i++) {
      // Random time between 50-150ms for each toggle
      const toggleTime = 50 + Math.floor(Math.random() * 100);
      
      toggleSequence.push(
        setTimeout(() => {
          setShowOpenMouth(prev => !prev);
        }, i * toggleTime)
      );
    }
    
    // Always end with mouth closed
    toggleSequence.push(
      setTimeout(() => {
        setShowOpenMouth(false);
      }, toggleCount * 100 + 50)
    );
    
    // Save the timeouts so we can clear them if needed
    mouthToggleRef.current = toggleSequence;
  };

  // Track when the user is typing
  const handleTyping = (e) => {
    const newValue = e.target.value;
    const isNewCharacter = newValue.length > comment.length;
    
    setComment(newValue);
    
    // Only trigger animation on new character input, not on deletions
    if (isNewCharacter) {
      // Trigger mouth animation sequence
      animateMouth();
    }
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (mouthToggleRef.current) {
        mouthToggleRef.current.forEach(clearTimeout);
      }
    };
  }, []);

  // Cycle through prompt suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptSuggestion(getRandomPrompt());
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexWrap="wrap"
      position="relative"
      onMouseMove={handleMouseMove}
    >
      {/* Celebration emojis */}
      {celebrationMode && activeCelebrationEmojis.map((emojiData, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            left: emojiData.left,
            bottom: 0,
            fontSize: '2rem',
            animation: `${emojiFloat} ${emojiData.duration} ${emojiData.delay} forwards`,
            zIndex: 100,
          }}
        >
          {emojiData.emoji}
        </Box>
      ))}
      
      {/* TV snow effect while loading */}
      {showSnow && <TvSnow />}
      
      <Zoom in timeout={800}>
        <Card 
          elevation={4}
          sx={{
            width: { xs: '95%', sm: 450, md: 500 },
            borderRadius: 2,
            p: 3,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #171717 0%, #262626 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
            boxShadow,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            animation: isSuccess ? `${pulseEffect} 1.5s ease-in-out` : 'none',
            position: 'relative',
          }}
        >
          <StephsActualFavoriteTypography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 3,
              color: theme.palette.secondary.main,
              textShadow: `3px 3px 0 ${darken(theme.palette.secondary.dark, 0.5)}`,
              animation: `${floatAnimation} 3s infinite ease-in-out`,
            }}
          >
            Share Your Thoughts
          </StephsActualFavoriteTypography>
          
          <FormControl sx={{ width: '100%' }}>
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormLabel
                sx={{ 
                  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
                  fontWeight: 'bold',
                }}
              >
                Your message
              </FormLabel>
              
              <Tooltip title="Add emoji">
                <IconButton 
                  size="small" 
                  color="secondary"
                  onClick={() => setShowEmojis(!showEmojis)}
                  sx={{ 
                    animation: showEmojis ? `${glowEffect} 2s infinite` : 'none',
                    width: 40,
                    height: 40,
                    position: 'relative',
                  }}
                >
                  {/* Display either open or closed mouth based on state */}
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center',
                  }}>
                    {showOpenMouth ? (
                      <RandomIcon
                        color="secondary"
                        sx={{ fontSize: 24 }}
                      />
                    ) : (
                      <SentimentSatisfiedAltIcon 
                        color="secondary"
                        sx={{ fontSize: 24 }}
                      />
                    )}
                  </Box>
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Emoji picker */}
            <Fade in={showEmojis}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 1, 
                  mb: 2, 
                  display: showEmojis ? 'flex' : 'none',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  maxWidth: '100%',
                  borderRadius: 2,
                  background: theme.palette.background.paper,
                }}
              >
                {WEDDING_EMOJIS.map((emoji, index) => (
                  <Box 
                    key={index}
                    component="button"
                    onClick={() => insertEmoji(emoji)}
                    sx={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: rem(20),
                      cursor: 'pointer',
                      borderRadius: '50%',
                      p: 0.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.2)',
                        background: theme.palette.action.hover,
                      }
                    }}
                  >
                    {emoji}
                  </Box>
                ))}
              </Paper>
            </Fade>
            
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              aria-label="comment text area"
              minRows={4}
              placeholder={family?.invitationResponseNotes || promptSuggestion}
              value={comment}
              onChange={handleTyping}
              disabled={isFetching || familyActions.getFamilyUnitQuery.isFetching}
            />
            
            {/* Character counter */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'flex-end', 
              mt: 0.5,
              fontSize: rem(12),
              fontStyle: 'italic',
              color: comment.length > 500 ? 'error.main' : 'text.secondary',
            }}>
              {comment.length}/500 characters
            </Box>

            {/* Suggestion prompt */}
            <Fade in={!comment && !family?.invitationResponseNotes}>
              <Box sx={{ 
                mt: 1.5, 
                fontSize: rem(13),
                fontStyle: 'italic',
                color: theme.palette.text.secondary,
                animation: `${pulseEffect} 4s infinite`,
              }}>
                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                  Need inspiration? How about: "{promptSuggestion}"
                </Typography>
              </Box>
            </Fade>

            {/* Row for the send button and any extra info */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSend}
                disabled={
                  isFetching || 
                  !comment || 
                  comment.length > 500 ||
                  familyActions.getFamilyUnitQuery.isFetching
                }
                startIcon={isUnchanged ? <CelebrationIcon /> : <SendIcon />}
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: 8,
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  '&:not(:disabled):hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)',
                  }
                }}
              >
                {isError ? 'Try Again' : ''}
                {isFetching ? 'Sending...' : ''}
                {isIdle && !isUnchanged ? 'Send Message' : ''}
                {(isIdle || isSuccess) && isUnchanged ? 'Message Sent!' : ''}
              </Button>
            </Box>

            {/* Status messages */}
            <Box sx={{ mt: 2, minHeight: '40px' }}>
              {isFetching && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="secondary" />
                  <Typography variant="body2">Sending your message...</Typography>
                </Box>
              )}
              
              {isError && (
                <Box sx={{ color: 'error.main' }}>
                  <Typography variant="body2">
                    Error: {(error as ApiError)?.description || 'Something went wrong. Please try again.'}
                  </Typography>
                </Box>
              )}
              
              {!!data && !isFetching && (
                <Box sx={{ 
                  color: 'success.main',
                  p: 1,
                  borderLeft: `4px solid ${theme.palette.success.main}`,
                  bgcolor: theme.palette.success.light + '20',
                  borderRadius: '4px',
                }}>
                  <Typography variant="body2">
                    Thank you for your message! We've saved it and look forward to seeing you at the wedding!
                  </Typography>
                </Box>
              )}
            </Box>
          </FormControl>
        </Card>
      </Zoom>
      
      <Box sx={{ 
        width: '100%', 
        textAlign: 'center',
        mt: 4,
        opacity: 0.8,
      }}>
        <Typography variant="caption" sx={{ 
          fontStyle: 'italic',
          color: theme.palette.text.secondary,
        }}>
          Formal RSVP invitations to come in the mail. Stay tuned!
        </Typography>
      </Box>
    </Box>
  );
}

const Textarea = styled(BaseTextareaAutosize)(
  ({ theme }) => `
    box-sizing: border-box;
    width: 100%;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: ${rem(16)};
    font-weight: 400;
    line-height: 1.5;
    padding: 12px 16px;
    border-radius: 12px;
    color: ${theme.palette.mode === 'dark' ? '#e0e0e0' : '#333'};
    background: ${theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? '#444' : '#ddd'};
    box-shadow: ${theme.palette.mode === 'dark' 
      ? '0 2px 8px rgba(0, 0, 0, 0.3) inset' 
      : '0 2px 8px rgba(0, 0, 0, 0.05) inset'
    };
    transition: all 0.2s ease;
    resize: none;
  
    &:hover {
      border-color: ${theme.palette.secondary.main};
    }

    &:focus {
      border-color: ${theme.palette.secondary.main};
      box-shadow: 0 0 0 3px ${theme.palette.secondary.main}40;
    }

    &:focus-visible {
      outline: 0;
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      background: ${theme.palette.mode === 'dark' ? '#252525' : '#f5f5f5'};
    }
  `,
);
