import { useState, useEffect, useMemo } from 'react';
import { FamilyUnitDto, InvitationResponseEnum } from '@/types/api';
import { useFamily } from '@/store/family';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { SortOption, StepCompletion, FamilyStats } from '../types/types';

export const useFamilyData = () => {
  const { getAllFamiliesQuery } = useAdminQueries();
  const [userFamily] = useFamily(); // Get current user's family data from store
  const [allFamilies, setAllFamilies] = useState<FamilyUnitDto[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyUnitDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('lastUpdated');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  
  // Calculate completion status for a family
  const calculateCompletionStatus = (family: FamilyUnitDto): StepCompletion => {
    return {
      hasGuests: Boolean(family.guests?.length),
      hasAgeGroups: Boolean(family.guests?.some(guest => guest.ageGroup)),
      hasNotificationPrefs: Boolean(family.guests?.some(guest => 
        guest.preferences?.notificationPreference?.length
      )),
      hasFoodPrefs: Boolean(family.guests?.some(guest => 
        guest.preferences?.foodPreference || 
        (guest.preferences?.foodAllergies && guest.preferences?.foodAllergies.length > 0)
      )),
      hasAccommodation: Boolean(family.guests?.some(guest => 
        guest.preferences?.sleepPreference
      )),
      hasMailingAddress: Boolean(family.mailingAddress?.streetAddress),
      hasComments: Boolean(family.invitationResponseNotes)
    };
  };

  const calculateLastNames = (family: FamilyUnitDto): string => {
    const lastNames = Array.from(new Set(family.guests?.map((user) => user.lastName)))
    .map((lastName) => `${lastName}`)
    .join(' & ');
    return lastNames;
  };

  // Calculate overall completion percentage
  const calculateCompletionPercentage = (family: FamilyUnitDto): number => {
    const completion = calculateCompletionStatus(family);
    const steps = Object.values(completion);
    const completedSteps = steps.filter(step => step).length;
    return Math.round((completedSteps / steps.length) * 100);
  };
  
  // Sort families based on selected option
  const sortFamilies = (families: FamilyUnitDto[], option: SortOption): FamilyUnitDto[] => {
    return [...families].sort((a, b) => {
      switch (option) {
        case 'name':
          return (a.unitName?.toLowerCase() || '').localeCompare(b.unitName?.toLowerCase() || '');
        case 'invitationCode':
          return (a.invitationCode || '').localeCompare(b.invitationCode || '');
        case 'guestCount':
          return (b.guests?.length || 0) - (a.guests?.length || 0);
        case 'responseStatus':
          const aInterested = a.guests?.filter(g => 
            g.rsvp?.invitationResponse === InvitationResponseEnum.Interested
          ).length || 0;
          const bInterested = b.guests?.filter(g => 
            g.rsvp?.invitationResponse === InvitationResponseEnum.Interested
          ).length || 0;
          return bInterested - aInterested;
        case 'completionStatus':
          return calculateCompletionPercentage(b) - calculateCompletionPercentage(a);
        case 'lastUpdated':
          // Sort by last updated, most recent first
          // Safely access lastUpdated property which might not exist on the type
          const aTimestamp = (a as any).lastUpdated ? new Date((a as any).lastUpdated).getTime() : 0;
          const bTimestamp = (b as any).lastUpdated ? new Date((b as any).lastUpdated).getTime() : 0;
          return bTimestamp - aTimestamp;
        default:
          return 0;
      }
    });
  };

  // Effect to fetch all families
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        
        // Fetch data
        const response = await getAllFamiliesQuery.refetch();
        
        if (response.data) {          
          // Filtering of test families performed on backend in stats
          const families = response.data;
          
          // Sort alphabetically by family name
          const sortedFamilies = families.sort((a, b) => {
            const aName = a.unitName?.toLowerCase() || '';
            const bName = b.unitName?.toLowerCase() || '';
            return aName.localeCompare(bName);
          });
          
          setAllFamilies(sortedFamilies);
          
          // Set initial selected family (either user's family or first in list)
          if (userFamily && userFamily.invitationCode) {
            const userFamilyFromList = sortedFamilies.find(f => 
              f.invitationCode === userFamily.invitationCode
            );
            if (userFamilyFromList) {
              setSelectedFamily(userFamilyFromList);
            } else if (sortedFamilies.length > 0) {
              setSelectedFamily(sortedFamilies[0]);
            }
          } else if (sortedFamilies.length > 0) {
            setSelectedFamily(sortedFamilies[0]);
          }
        } else if (response.error) {
          setError('Failed to fetch families');
        }
      } catch (err) {
        setError('An error occurred while fetching families');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFamilies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate aggregate statistics for all families
  const familyStats = useMemo((): FamilyStats => {
    const totalFamilies = allFamilies.length;
    const totalGuests = allFamilies.reduce((total, family) => total + (family.guests?.length || 0), 0);
    const interestedGuests = allFamilies.reduce((total, family) => 
      total + (family.guests?.filter(g => 
        g.rsvp?.invitationResponse === InvitationResponseEnum.Interested
      ).length || 0), 0);
    const declinedGuests = allFamilies.reduce((total, family) => 
      total + (family.guests?.filter(g => 
        g.rsvp?.invitationResponse === InvitationResponseEnum.Declined
      ).length || 0), 0);
    const pendingGuests = totalGuests - interestedGuests - declinedGuests;
    
    return {
      totalFamilies,
      totalGuests,
      interestedGuests,
      declinedGuests,
      pendingGuests,
      interestedPercentage: totalGuests > 0 ? Math.round((interestedGuests / totalGuests) * 100) : 0,
      declinedPercentage: totalGuests > 0 ? Math.round((declinedGuests / totalGuests) * 100) : 0,
      pendingPercentage: totalGuests > 0 ? Math.round((pendingGuests / totalGuests) * 100) : 0
    };
  }, [allFamilies]);
  
  // Filter families based on search query
  const filteredFamilies = useMemo(() => {
    // First filter by search query
    const filtered = allFamilies.filter(family => {
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      
      // Search by family name
      if (family.unitName?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by invitation code
      if (family.invitationCode?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by guest names
      if (family.guests?.some(guest => 
        guest.firstName?.toLowerCase().includes(searchLower) || 
        guest.lastName?.toLowerCase().includes(searchLower)
      )) {
        return true;
      }
      
      return false;
    });
    
    // Then sort by selected option
    return sortFamilies(filtered, sortOption);
  }, [allFamilies, searchQuery, sortOption]);

  // Handle sort menu open
  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  // Handle sort menu close and selection
  const handleSortClose = (option?: SortOption) => {
    setSortAnchorEl(null);
    if (option) {
      setSortOption(option);
    }
  };
  
  // Handle family selection
  const handleFamilySelect = (family: FamilyUnitDto) => {
    setSelectedFamily(family);
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    getAllFamiliesQuery.refetch();
  };

  return {
    allFamilies,
    filteredFamilies,
    selectedFamily,
    loading,
    error,
    searchQuery,
    sortOption,
    sortAnchorEl,
    familyStats,
    calculateCompletionStatus,
    calculateCompletionPercentage,
    calculateLastNames,
    handleSortClick,
    handleSortClose,
    handleFamilySelect,
    handleSearchChange,
    handleRefresh,
    setSelectedFamily,
    getAllFamiliesQuery
  };
};