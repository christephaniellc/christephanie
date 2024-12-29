import { createContext, useContext, useMemo } from 'react';
import { useRSVP } from './useRSVP';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { FamilyUnitDto, GuestDto } from '../../../../../types/types';


interface RsvpContextProps {
  invitationCode: string;
  firstName: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, field: 'rsvpCode' | 'firstName') => void;
  error: string;
  matchingUsers: GuestDto[] | undefined | null;
  getFamilyQuery: UseMutationResult<FamilyUnitDto, unknown, { inviteCode: string, firstName: string }, unknown>;
  hasAddress: boolean;
  nobodyComing: boolean;
  lastNames: string;
  allLastNames: string;
  setUserIsAttending: (guest: GuestDto, guestInterested: 'Pending' | 'Interested' | 'Declined') => void;
  setFamilyUnitAddress: (addressPortion: 'street' | 'apt' | 'lastLine', value: string) => void;
  familyUnit: FamilyUnitDto | null;
  addressValidated: boolean;
  handleClick: () => void;
  allUsersPending: boolean;
  actionNeededMessage: string;
}

const RsvpContext = createContext<RsvpContextProps | undefined>(undefined);

export const RsvpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    invitationCode,
    handleClick,
    firstName,
    addressValidated,
    familyUnit,
    handleChange,
    error,
    matchingUsers,
    getFamilyQuery,
    setMatchingUsers,
    setUserIsAttending,
    setFamilyUnitAddress,
    allUsersPending,
    actionNeededMessage
  } = useRSVP();

  const hasAddress = useMemo(() => {
    return familyUnit?.mailingAddress !== null;
  }, [familyUnit]);

  const nobodyComing = useMemo(() => {
    if (matchingUsers) {
      return matchingUsers.every((user) => user.rsvp?.invitationResponse !== 'Interested');
    }
    return false;
  }, [matchingUsers]);

  const allLastNames = useMemo(() => {
    if (matchingUsers) {
      return Array.from(new Set(matchingUsers.map((user) => user.lastName))).map((lastName) => `${lastName}s`).join(' & ');
    }
    return '';
  }, [matchingUsers]);

  const lastNames = useMemo(() => {
    if (matchingUsers) {
      const lastNamesList = matchingUsers
        .filter((user) => user.rsvp?.invitationResponse === 'Interested')
        .map((user) => user.lastName).join(' & ');
      const lastNames = new Set(lastNamesList.split(' & '));
      const pluralizedLastnames = Array.from(lastNames).map((lastName) => `${lastName}s`).join(' & ');
      return pluralizedLastnames;
    }
    return '';
  }, [matchingUsers]);


  return (
    <RsvpContext.Provider value={{
      invitationCode,
      firstName,
      handleChange,
      error,
      matchingUsers,
      getFamilyQuery,
      hasAddress,
      nobodyComing,
      lastNames,
      setUserIsAttending,
      allLastNames,
      setFamilyUnitAddress,
      familyUnit,
      addressValidated,
      handleClick,
      allUsersPending,
      actionNeededMessage
    }}>
      {children}
    </RsvpContext.Provider>
  );
};
export const useRsvpContext = (): RsvpContextProps => {
  const context = useContext(RsvpContext);
  if (!context) {
    throw new Error('useRsvp must be used within a RsvpProvider');
  }
  return context;
};