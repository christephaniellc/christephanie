import { atom, useRecoilState } from 'recoil';
import { useCallback, useEffect, useMemo } from 'react';
import { FamilyUnitDto } from '@/types/api';
import { userState } from '@/store/user';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/context/ApiContext';

const familyState = atom<FamilyUnitDto | null>({
  key: 'familyUnit',
  default: null,
});

function useFamilyUnit() {
  const [familyUnit, setFamilyUnit] = useRecoilState(familyState);
  const { user: auth0User } = useAuth0();
  const { api } = useApi();

  const getFamilyUnitQuery = useQuery({
    queryKey: ['getFamilyUnit', auth0User?.sub],
    queryFn: () => api.getFamilyUnit(),
    enabled: !!auth0User
  });

  useEffect(() => {
    if (getFamilyUnitQuery.data) {
      setFamilyUnit(getFamilyUnitQuery.data);
    }
  }, [getFamilyUnitQuery.data]);

  const actions = useMemo(() => ({ getFamilyUnitQuery  }), [getFamilyUnitQuery]);

  return [familyUnit, actions];
}

export default useFamilyUnit;
