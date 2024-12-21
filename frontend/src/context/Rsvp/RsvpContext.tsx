import { createContext, useContext, useState } from 'react';
import { useRSVP } from './useRSVP';
import { UseQueryResult } from '@tanstack/react-query';
import { components } from '../../types/api';
import { FamilyUnitDto } from '../../utils/rsvpCodeMatch';


export type GuestDto = components['schemas']['GuestDto'];

interface RsvpContextProps {
  rsvpCode: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  matchingUsers: GuestDto[] | undefined | null;
  matchingUsersQuery: UseQueryResult<FamilyUnitDto>;
  familyInterested: boolean;
  setFamilyInterested: (familyInterested: boolean) => void;
}

const RsvpContext = createContext<RsvpContextProps | undefined>(undefined);

export const RsvpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { rsvpCode, handleChange, error, matchingUsers, matchingUsersQuery } = useRSVP();
  const [familyInterested, setFamilyInterested] = useState(false);
  return (
    <RsvpContext.Provider value={{ rsvpCode, handleChange, error, matchingUsers, matchingUsersQuery, familyInterested, setFamilyInterested }}>
      {children}
    </RsvpContext.Provider>
  );
}
export const useRsvpContext = (): RsvpContextProps => {
  const context = useContext(RsvpContext);
  if (!context) {
    throw new Error('useRsvp must be used within a RsvpProvider');
  }
  return context;
};