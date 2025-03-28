import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Box,
  Chip,
  useTheme,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { usePhotoConfigurations } from '../hooks/usePhotoConfigurations';
import { PhotoGridItem, CardOrientation } from '../types/types';

interface ConfigurationManagerProps {
  open: boolean;
  onClose: () => void;
  onLoad: (photoGrid: PhotoGridItem[], orientation: CardOrientation) => void;
  currentPhotoGrid: PhotoGridItem[];
  currentOrientation: CardOrientation;
}

const ConfigurationManager: React.FC<ConfigurationManagerProps> = ({
  open,
  onClose,
  onLoad,
  currentPhotoGrid,
  currentOrientation
}) => {
  const theme = useTheme();
  const {
    configurations,
    configName,
    setConfigName,
    isLoading,
    isSaving,
    isDeleting,
    saveConfiguration,
    deleteConfiguration
  } = usePhotoConfigurations();

  const handleSave = () => {
    if (currentPhotoGrid && currentPhotoGrid.length > 0) {
      saveConfiguration(currentPhotoGrid, currentOrientation);
    }
  };

  const handleLoadConfig = (photoGrid: PhotoGridItem[], orientation: CardOrientation) => {
    onLoad(photoGrid, orientation);
    onClose();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white',
        pb: 2
      }}>
        <Typography variant="h6">Photo Configuration Manager</Typography>
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
          Save your current layout or load a previous one
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Save Current Configuration
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Configuration Name"
              variant="outlined"
              size="small"
              fullWidth
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="E.g., My Favorite Layout"
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSaving || !configName.trim()}
            >
              Save
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Saved Configurations
          </Typography>
          
          {isLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              Loading saved configurations...
            </Typography>
          ) : configurations.length === 0 ? (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                bgcolor: 'rgba(0,0,0,0.02)'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No saved configurations yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Save your current layout to see it here.
              </Typography>
            </Paper>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {configurations.map((config) => (
                <Paper 
                  key={config.id} 
                  variant="outlined"
                  sx={{ 
                    mb: 2, 
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <ListItem 
                    button 
                    onClick={() => handleLoadConfig(config.photoGrid, config.orientation)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{config.name}</Typography>
                          <Chip
                            size="small"
                            label={config.orientation === 'horizontal' ? 'Landscape' : 'Portrait'}
                            color={config.orientation === currentOrientation ? 'primary' : 'default'}
                            icon={<ScreenRotationIcon />}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <AccessTimeIcon fontSize="small" sx={{ fontSize: '0.8rem', opacity: 0.6 }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(config.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConfiguration(config.id || '');
                        }}
                        disabled={isDeleting}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigurationManager;