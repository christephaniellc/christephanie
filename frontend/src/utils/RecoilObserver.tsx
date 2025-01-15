import React, { useEffect } from 'react';
import { useRecoilValue, RecoilState, RecoilValue } from 'recoil';

type RecoilObserverProps<T> = {
  node: RecoilValue<T> | RecoilState<T>;
  onChange: (value: T) => void;
};

export function RecoilObserver<T>({ node, onChange }: RecoilObserverProps<T>) {
  const value = useRecoilValue(node);
  useEffect(() => {
    onChange(value);
  }, [onChange, value]);
  return null;
}
