import * as React from 'react';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled, keyframes, darken } from '@mui/system';
import { 
  FormControl, FormLabel, Button, Box, CircularProgress, 
  Typography, Card, useTheme, Fade, Zoom, Paper, 
  Modal, useMediaQuery, SwipeableDrawer, IconButton
} from '@mui/material';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { ApiError } from '@/api/Api';
import { useRecoilState } from 'recoil';
import { userCommentState } from '@/store/userComment/userComment';
import { useFamily } from '@/store/family';
import { FamilyUnitDto } from '@/types/api';
import { useEffect, useState, useRef } from 'react';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyNoDrop } from '../AttendanceButton/AttendanceButton';
import SendIcon from '@mui/icons-material/Send';
import CelebrationIcon from '@mui/icons-material/Celebration';
import TvSnow from '@/components/MtvAnimatedTitle/TvSnow';
import { rem } from 'polished';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { Close } from '@mui/icons-material';
import isMobile from '@/utils/is-mobile';
import TalkingFace from '@/components/TalkingFace';

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
  const [modalOpen, setModalOpen] = useState(false);
  const textareaRef = useRef(null);
  const talkingFaceRef = useRef(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  // Add check for very small screens (smaller than iPhone 16 Pro - 852px height)
  const isVerySmallScreen = useMediaQuery('(max-height:850px)');


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
  
  // Handle modal open/close
  const handleModalOpen = () => {
    if (isMobile && isVerySmallScreen) {
      setModalOpen(true);
      // Small delay to ensure the drawer is fully open before focusing
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };
  
  const handleModalClose = () => {
    setModalOpen(false);
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
    "This website rules!",
  ];

  const getRandomPrompt = () => promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
  const [promptSuggestion, setPromptSuggestion] = useState(getRandomPrompt());
  const typingTimeoutRef = useRef(null);

  // Track when the user is typing
  const handleTyping = (e) => {
    const newValue = e.target.value;
    const isNewCharacter = newValue.length > comment.length;
    const isDeleting = newValue.length < comment.length;
    
    setComment(newValue);
    
    // Trigger animation on both new character input and deletions
    if ((isNewCharacter || isDeleting) && talkingFaceRef.current) {
      // Trigger mouth animation sequence
      talkingFaceRef.current.animateMouth();
    }
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
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

  // Content to be rendered in both regular and modal views
  const renderCardContent = (isModal = false) => (
    <Card 
      elevation={isModal ? 8 : 4}
      sx={{
        width: isModal ? '100%' : { xs: '95%', sm: 450, md: 500 },
        borderRadius: 2,
        p: 3,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #171717 0%, #262626 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f7f7f7 100%)',
        border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
        boxShadow: isModal ? undefined : boxShadow,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        animation: isSuccess ? `${pulseEffect} 1.5s ease-in-out` : 'none',
        position: 'relative',
        ...(isModal && {
          maxHeight: '80vh',
          overflowY: 'auto'
        })
      }}
    >
      <StephsActualFavoriteTypographyNoDrop
        variant="h5"
        sx={{
          textAlign: 'center',
          mb: 3,
          color: theme.palette.secondary.main,
          fontSize: '1.5rem'
        }}
      >
        Share Your Thoughts
      </StephsActualFavoriteTypographyNoDrop>
      
      <FormControl sx={{ width: '100%' }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Typography
            variant="overline"
            sx={{ 
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}
          >
            Your message:
          </Typography>
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
              zIndex: 5,
              position: 'relative'
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
        
        {/* Talking face and Textarea container */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative', mb: 1, mt: 2 }}>
          <Box sx={{ 
            mr: 0,
            position: 'relative',
            top: '-14px'
          }}>
            <TalkingFace
              ref={talkingFaceRef}
              showEmojis={showEmojis}
              onToggleEmojis={() => setShowEmojis(!showEmojis)}
              tooltipTitle="Add emoji"
              color="secondary"
              iconSize={36}
            />
          </Box>
          
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '10px', 
                left: '-10px', 
                width: 0, 
                height: 0, 
                borderTop: '10px solid transparent', 
                borderBottom: '10px solid transparent',
                borderRight: `10px solid ${theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff'}`,
                zIndex: 2
              }} 
            />
            {/* Border triangle for speech bubble */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '10px', 
                left: '-9px', 
                width: 0, 
                height: 0, 
                borderTop: '10px solid transparent', 
                borderBottom: '10px solid transparent',
                borderRight: `10px solid ${theme.palette.mode === 'dark' ? '#444' : '#ddd'}`,
                zIndex: 1
              }} 
            />
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              aria-label="comment text area"
              minRows={4}
              placeholder={family?.invitationResponseNotes || promptSuggestion}
              value={comment}
              onChange={handleTyping}
              onFocus={handleModalOpen}
              onKeyDown={(e) => {
                // Prevent keyboard events from closing the drawer
                e.stopPropagation();
              }}
              disabled={isFetching || familyActions.getFamilyUnitQuery.isFetching}
            />
          </Box>
        </Box>
        
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
  );

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
      
      {/* Bottom swipeable drawer for mobile devices */}
      <SwipeableDrawer
        anchor="bottom"
        open={modalOpen && isMobile && isVerySmallScreen}
        onClose={handleModalClose}
        onOpen={() => {}}
        disableBackdropTransition={true}
        disableDiscovery={true}
        swipeAreaWidth={0}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            height: 'auto',
            maxHeight: '90vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            background: 'transparent',
            overflow: 'visible',
          }
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            position: 'relative',
            pt: 1
          }}
        >
          {/* Drag indicator */}
          <Box 
            sx={{ 
              width: 40, 
              height: 5, 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: 2,
              mx: 'auto',
              mb: 1
            }} 
          />
          
          <IconButton
            onClick={handleModalClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              color: theme.palette.common.white,
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <Close />
          </IconButton>
          
          <Box sx={{ p: 2 }}>
            {renderCardContent(true)}
          </Box>
        </Box>
      </SwipeableDrawer>
      
      {/* Normal view for non-mobile */}
      {!modalOpen && 
        <Zoom in timeout={800}>
          {renderCardContent(false)}
        </Zoom>
      }
    </Box>
  );
}

const Textarea = styled(BaseTextareaAutosize)(
  ({ theme }) => `
    box-sizing: border-box;
    width: 100%;
    font-family: sans-serif;
    font-size: ${rem(16)};
    font-weight: 400;
    line-height: 1.5;
    padding: 12px 16px;
    border-radius: 12px;
    color: ${theme.palette.mode === 'dark' ? '#e0e0e0' : '#333'};
    background: ${theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? '#444' : '#ddd'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    resize: none;
  
    &:hover {
      border-color: ${theme.palette.secondary.main};
    }

    &:focus {
      border-color: ${theme.palette.secondary.main};
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