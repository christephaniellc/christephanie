import React from 'react';
import { 
  Box, 
  Modal, 
  Backdrop, 
  Fade, 
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FamilyUnitDto } from '@/types/api';
import { CardSide, CardOrientation } from '../types/types';
import { CardFrontHorizontal } from './card-variants/CardFrontHorizontal';
import { CardFrontVertical } from './card-variants/CardFrontVertical';
import { CardBackHorizontal } from './card-variants/CardBackHorizontal';
import { CardBackVertical } from './card-variants/CardBackVertical';

interface CardModalProps {
  open: boolean;
  onClose: () => void;
  family: FamilyUnitDto | null;
  cardSide: CardSide;
  orientation: CardOrientation;
}

const CardModal: React.FC<CardModalProps> = ({
  open,
  onClose,
  family,
  cardSide,
  orientation
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: 'auto',
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            width: '100%', 
            mb: 2,
            alignItems: 'center'
          }}>
            <Typography variant="h6" component="h2">
              Card Preview - {cardSide === 'front' ? 'Address Side' : 'Picture Side'} ({orientation})
            </Typography>
            <IconButton onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ 
            overflow: 'auto', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            py: 2
          }}>
            {cardSide === 'front' && orientation === 'horizontal' && (
              <CardFrontHorizontal selectedFamily={family} />
            )}
            {cardSide === 'front' && orientation === 'vertical' && (
              <CardFrontVertical selectedFamily={family} />
            )}
            {cardSide === 'back' && orientation === 'horizontal' && (
              <CardBackHorizontal />
            )}
            {cardSide === 'back' && orientation === 'vertical' && (
              <CardBackVertical />
            )}
          </Box>
          
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Actual card dimensions: 6" × 4" ({orientation === 'horizontal' ? 'landscape' : 'portrait'})
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
};

export default CardModal;