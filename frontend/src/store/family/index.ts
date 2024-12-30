import { atom, useRecoilState } from 'recoil';
import { useCallback, useEffect, useMemo } from 'react';
import { FamilyUnitDto } from '@/types/api';
import { userState } from '@/store/user';

const familyState = atom<Partial<FamilyUnitDto> | null>({
  key: 'familyUnit',
  default: null,
});

function useFamilyUnit() {
  const [familyUnit, setFamilyUnit] = useRecoilState(familyState);

  const updateFamily = useCallback((familyUnit: Partial<FamilyUnitDto>) => {
    setFamilyUnit(familyUnit);
  }, [setFamilyUnit]);

  const memoizedActions = useMemo(() => ({ updateFamilyUnit: updateFamily }), [updateFamily]);

  return [familyUnit, memoizedActions];
}

export default useFamilyUnit;
