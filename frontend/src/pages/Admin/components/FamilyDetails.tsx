import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Divider, 
  Paper,
  Skeleton,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogContent
} from '@mui/material';
import { AddressDto, FamilyUnitDto, GuestDto, PatchFamilyUnitRequest } from '@/types/api';
import { useApiContext } from '@/context/ApiContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { formatDate } from './AdminHelpers';

// Import components
import AddressEditor from './AddressEditor';
import GuestList from './GuestList';
import GuestEditor from './GuestEditor';

interface FamilyDetailsProps {
  family: FamilyUnitDto | null;
  loading?: boolean;
  onFamilyUpdate?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`family-tabpanel-${index}`}
      aria-labelledby={`family-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `family-tab-${index}`,
    'aria-controls': `family-tabpanel-${index}`,
  };
}

const FamilyDetails: React.FC<FamilyDetailsProps> = ({ 
  family, 
  loading = false,
  onFamilyUpdate 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedFamily, setEditedFamily] = useState<FamilyUnitDto | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestDto | null>(null);
  
  const { apiInstance } = useApiContext();

  // Update edited family when family prop changes
  React.useEffect(() => {
    if (family) {
      setEditedFamily(family);
    }
  }, [family]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEditFamily = () => {
    setEditMode(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedFamily(family);
    setUpdateError(null);
  };
  
  const handleFamilyFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editedFamily) {
      setEditedFamily({
        ...editedFamily,
        [name]: value
      });
    }
  };
  
  const handleSaveFamily = async () => {
    if (!editedFamily || !family || !apiInstance) return;
    
    try {
      // Create a full updated family object with the edited notes
      const updatedFamily = {
        ...family,
        invitationResponseNotes: editedFamily.invitationResponseNotes
      };
      
      // Call the admin API to update the family with the full family object
      await apiInstance.adminUpdateFamily(updatedFamily);
      
      setUpdateSuccess(true);
      setUpdateError(null);
      setEditMode(false);
      
      // Notify parent component
      if (onFamilyUpdate) {
        onFamilyUpdate();
      }
    } catch (error) {
      console.error('Failed to update family:', error);
      setUpdateError('Failed to update family. Please try again.');
    }
  };
  
  const handleAddressUpdate = async (updatedAddress: AddressDto) => {
    if (!family || !apiInstance) return;
    
    try {
      // Clone the family and update the address
      const updatedFamily = {
        ...family,
        mailingAddress: updatedAddress
      };
      
      // Use the admin API to update the family with the full family object
      // This ensures we're using the admin endpoint that can modify any family
      await apiInstance.adminUpdateFamily(updatedFamily);
      
      // Update local state
      if (editedFamily) {
        setEditedFamily({
          ...editedFamily,
          mailingAddress: updatedAddress
        });
      }
      
      setUpdateSuccess(true);
      
      // Notify parent component
      if (onFamilyUpdate) {
        onFamilyUpdate();
      }
    } catch (error) {
      console.error('Failed to update address:', error);
      setUpdateError('Failed to update address. Please try again.');
      throw error;
    }
  };
  
  const handleEditGuest = (guest: GuestDto) => {
    setSelectedGuest(guest);
  };
  
  const handleCloseGuestEditor = () => {
    setSelectedGuest(null);
  };
  
  const handleGuestSaved = () => {
    // Close the editor dialog
    setSelectedGuest(null);
    
    // Notify the parent component to refresh data
    if (onFamilyUpdate) {
      onFamilyUpdate();
    }
    
    // Show success message
    setUpdateSuccess(true);
    
    // Reset the success message after a delay
    setTimeout(() => {
      setUpdateSuccess(false);
    }, 3000);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="50%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!family) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%'
      }}>
        <Typography variant="body1" color="text.secondary">
          Select a family to view details
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%' 
    }}>
      {/* Guest Editor Dialog */}
      <Dialog 
        open={!!selectedGuest} 
        onClose={handleCloseGuestEditor}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedGuest && family && (
            <GuestEditor 
              guest={selectedGuest}
              family={family}
              onCancel={handleCloseGuestEditor}
              onSave={handleGuestSaved}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" component="h2">
            {family.unitName || 'Unnamed Family'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Invitation Code: {family.invitationCode}
            {family.tier && ` • Tier: ${family.tier}`}
          </Typography>
        </Box>
        
        {!editMode && (
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            onClick={handleEditFamily}
            size="small"
          >
            Edit Family
          </Button>
        )}
      </Box>
      
      {updateError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateError}
        </Alert>
      )}
      
      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Family updated successfully
        </Alert>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="family details tabs">
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Guests" {...a11yProps(1)} />
            <Tab label="Address" {...a11yProps(2)} />
            <Tab label="RSVP" {...a11yProps(3)} />
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Family Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {editMode ? (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Family Unit Name"
                  name="unitName"
                  value={editedFamily?.unitName || ''}
                  onChange={handleFamilyFieldChange}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Tier"
                  name="tier"
                  value={editedFamily?.tier || ''}
                  onChange={handleFamilyFieldChange}
                  margin="normal"
                  disabled // Tier should generally not be editable directly
                />
                
                <TextField
                  fullWidth
                  label="Potential Head Count"
                  name="potentialHeadCount"
                  value={editedFamily?.potentialHeadCount || ''}
                  onChange={handleFamilyFieldChange}
                  margin="normal"
                  type="number"
                  disabled // This is calculated, not directly editable
                />
                
                <TextField
                  fullWidth
                  label="Invitation Response Notes"
                  name="invitationResponseNotes"
                  value={editedFamily?.invitationResponseNotes || ''}
                  onChange={handleFamilyFieldChange}
                  margin="normal"
                  multiline
                  rows={4}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={handleCancelEdit}
                    startIcon={<CancelIcon />}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleSaveFamily}
                    startIcon={<SaveIcon />}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="body1" paragraph>
                  <strong>Family Unit Name:</strong> {family.unitName || 'N/A'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Tier:</strong> {family.tier || 'N/A'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Potential Head Count:</strong> {family.potentialHeadCount || 'N/A'}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Last Login:</strong> {formatDate(family.familyUnitLastLogin)}
                </Typography>
                {family.invitationResponseNotes && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Invitation Response Notes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {family.invitationResponseNotes}
                    </Typography>
                  </>
                )}
              </>
            )}
          </Paper>
        </TabPanel>
        
        {/* Guests Tab */}
        <TabPanel value={tabValue} index={1}>
          <GuestList 
            guests={family.guests} 
            onEditGuest={handleEditGuest}
          />
        </TabPanel>
        
        {/* Address Tab */}
        <TabPanel value={tabValue} index={2}>
          <AddressEditor 
            address={family.mailingAddress} 
            onAddressUpdate={handleAddressUpdate}
          />
          
          {family.additionalAddresses && family.additionalAddresses.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Addresses
              </Typography>
              {family.additionalAddresses.map((address, index) => (
                <Box key={index} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Additional Address {index + 1}
                  </Typography>
                  <AddressEditor 
                    address={address} 
                    onAddressUpdate={(updatedAddress) => {
                      // This would need a custom endpoint to update additional addresses
                      console.log('Update additional address:', updatedAddress);
                      return Promise.resolve();
                    }}
                    readOnly={true} // For now, set as read-only until we implement the update endpoint
                  />
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>
        
        {/* RSVP Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="body1" paragraph>
            To view and manage RSVPs for this family, please check the <strong>Guests</strong> tab for individual guest RSVP details.
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              RSVP Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" paragraph>
              <strong>Total Guests:</strong> {family.guests?.length || 0}
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>Wedding Attending:</strong> {
                family.guests?.filter(g => g.rsvp?.wedding === 'Attending').length || 0
              } guests
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>Rehearsal Dinner Attending:</strong> {
                family.guests?.filter(g => g.rsvp?.rehearsalDinner === 'Attending').length || 0
              } guests
            </Typography>
            
            <Typography variant="body1" paragraph>
              <strong>Fourth of July Attending:</strong> {
                family.guests?.filter(g => g.rsvp?.fourthOfJuly === 'Attending').length || 0
              } guests
            </Typography>
          </Paper>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default FamilyDetails;