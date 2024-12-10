import { useEffect, useMemo, useState } from 'react';
import { useChristephanieTheme } from '../ThemeContext';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { components } from '../../types/api';
import { FamilyUnitDto, rsvpCodeMatch } from '../../utils/rsvpCodeMatch';

export const useRSVP = () => {
  const { mixedBackgroundSx, mode } = useChristephanieTheme();
  const [rsvpCode, setRsvpCode] = useState('');
  const [error, setError] = useState('');

  const matchingUsersQuery: UseQueryResult<FamilyUnitDto> = useQuery({
    queryKey: ['rsvpCodeMatch', rsvpCode],
    queryFn: () => rsvpCodeMatch(rsvpCode),
    enabled: rsvpCode.length === 5,
  });

  const matchingUsers: components['schemas']['GuestDto'][] | null | undefined = useMemo(() => {
      return matchingUsersQuery.data?.guests;
  }, [matchingUsersQuery.data]);


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.toUpperCase();
    setRsvpCode(inputValue);
    console.log('I am setting things bc thats what i\'m supposed to do');
    if (inputValue.length < 5) {
      setError('RSVP codes are 5 characters long, you hacker');
    } else {
      setError('');
    }
  };

  useEffect(() => {
    console.log(rsvpCode);
  }, [rsvpCode]);

  return {
    mixedBackgroundSx,
    mode,
    rsvpCode,
    error,
    handleChange,
    matchingUsers,
    matchingUsersQuery,
  };
};