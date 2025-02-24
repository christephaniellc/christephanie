// Type guards for FamilyUnitDto and GuestDto to identify API response types
import { FamilyUnitDto, GuestDto } from '@/types/api';
import { QueryKey, useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createContext, useEffect, useRef, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { familyState } from '@/store/family';

function isFamilyUnitDto(data: any): data is FamilyUnitDto {
  return data && typeof data === 'object' && 'familyId' in data;  // adjust property check as appropriate
}
function isGuestDto(data: any): data is GuestDto {
  return data && typeof data === 'object' && 'guestId' in data;   // adjust property check as appropriate
}

// Create a Context to expose any API utilities (if needed)
interface ApiContextValue {
  useDebouncedQuery?<TData, TError = unknown>(
    queryKey: QueryKey,
    queryFn: () => Promise<TData>,
    options?: UseQueryOptions<TData, TError> & { debounce?: boolean; debounceMs?: number }
  ): ReturnType<typeof useQuery>;
  useDebouncedMutation?<TVariables, TData = unknown, TError = unknown>(
    mutationFn: (vars: TVariables) => Promise<TData>,
    options?: UseMutationOptions<TData, TError, TVariables> & { debounce?: boolean; debounceMs?: number; updateFamilyState?: boolean }
  ): ReturnType<typeof useMutation>;
}
const ApiContext = createContext<ApiContextValue>({});

// ** Debounced useQuery Hook ** – Only executes the query after a delay, dropping previous calls within the delay.
function useDebouncedQuery<TData, TError = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: UseQueryOptions<TData, TError> & { debounce?: boolean; debounceMs?: number } = {}
) {
  const { debounce = false, debounceMs = 3000, enabled = true, ...restOptions } = options;
  // If not opting in to debounce, run the query normally
  if (!debounce) {
    return useQuery(queryKey, queryFn, { enabled, ...restOptions });
  }

  // Debounce logic: use local state and ref to track when to allow the query
  const [ready, setReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Whenever the query key or enabled flag changes, reset the debounce timer
  useEffect(() => {
    if (!enabled) {
      // If query is disabled, do nothing (will not run)
      return;
    }
    // Reset the ready flag and start a new timer
    setReady(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setReady(true); // After debounce period, mark ready to fetch
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, debounceMs, /* dependencies: include variables that change queryKey if needed */ queryKey]);

  // Use React Query's useQuery with the `enabled` flag controlled by our debounce
  return useQuery(queryKey, queryFn, {
    enabled: enabled && ready,   // only fetch when ready
    ...restOptions
  });
}

// ** Debounced useMutation Hook ** – Debounces mutation calls and supports optimistic updates to Recoil.
function useDebouncedMutation<TVariables, TData = unknown, TError = unknown>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TError, TVariables> & { debounce?: boolean; debounceMs?: number; updateFamilyState?: boolean } = {}
) {
  const { debounce = false, debounceMs = 3000, updateFamilyState = false, ...restOptions } = options;
  const setFamily = useSetRecoilState(familyState);           // function to update Recoil family state
  const familyRef = useRef<FamilyUnitDto | null>(null);       // to store the original family state for rollback
  const pendingVarsRef = useRef<TVariables | null>(null);     // last variables waiting to be sent
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Underlying mutation hook from React Query
  const mutation = useMutation<TData, TError, TVariables>({
    mutationFn,
    // We will handle optimistic updates and errors ourselves if updateFamilyState is true,
    // but you can still supply onSuccess/onError via options for additional handling.
    ...restOptions
  });

  // Debounced mutate function
  const debouncedMutate = (vars: TVariables) => {
    if (!debounce) {
      // If not debounced, just execute immediately
      mutation.mutate(vars);
      return;
    }
    // Clear any existing queued mutation
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // If this is the first call in a debounce interval, capture the current state for potential rollback
    if (pendingVarsRef.current === null && updateFamilyState) {
      familyRef.current = JSON.parse(JSON.stringify( // deep clone the state
        // @ts-ignore - assume familyState is JSON-serializable
        // Get current family state value (useRecoilState could be used here as well)
        // For safety in TypeScript, ensure FamilyUnitDto is serializable or clone appropriately.
        // Alternatively, use a recoil callback to get the value without causing re-renders.
        (window as any).recoilFamilyStateValue || {}
      ));
      // Note: In a real setup, use a Recoil snapshot or useRecoilValue to get the current value.
      // Here we assume a global way to read the atom or that we have it in scope.
    }
    // Optimistically update Recoil state immediately for UI responsiveness
    if (updateFamilyState) {
      setFamily(prevState => {
        if (!prevState) return prevState;
        const newData = vars as any;
        if (isFamilyUnitDto(newData)) {
          // Merge changes for FamilyUnitDto
          return { ...prevState, ...newData };
        } else if (isGuestDto(newData)) {
          // Merge or add GuestDto to family state's guest list
          const updatedFamily = { ...prevState };
          if (Array.isArray(updatedFamily.guests)) {
            const idx = updatedFamily.guests.findIndex(g => g.id === newData.id);
            if (idx >= 0) {
              updatedFamily.guests[idx] = { ...updatedFamily.guests[idx], ...newData };
            } else {
              updatedFamily.guests = [...updatedFamily.guests, newData];
            }
          }
          return updatedFamily;
        }
        return prevState;
      });
    }
    // Update the last pending variables
    pendingVarsRef.current = vars;
    // Schedule the actual mutation API call after debounce delay
    timerRef.current = setTimeout(() => {
      // Execute the mutation with the last queued variables
      mutation.mutate(pendingVarsRef.current as TVariables, {
        onSuccess: (data, variables, context) => {
          // If the API returns updated Family/Guest data, update Recoil state with it
          if (updateFamilyState && data && (isFamilyUnitDto(data) || isGuestDto(data))) {
            setFamily(prevState => {
              if (!prevState) return prevState;
              if (isFamilyUnitDto(data)) {
                return data as FamilyUnitDto;
              } else if (isGuestDto(data)) {
                const updatedFamily = { ...prevState };
                if (Array.isArray(updatedFamily.guests)) {
                  const idx = updatedFamily.guests.findIndex(g => g.id === (data as GuestDto).id);
                  if (idx >= 0) {
                    updatedFamily.guests[idx] = data as GuestDto;
                  } else {
                    updatedFamily.guests = [...updatedFamily.guests, data as GuestDto];
                  }
                }
                return updatedFamily;
              }
              return prevState;
            });
          }
          // Clear the saved original state reference on success (no need to rollback)
          if (updateFamilyState) {
            familyRef.current = null;
          }
          // Call any custom onSuccess handler passed in options
          restOptions.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
          // On failure, rollback the Recoil state to the last known good state
          if (updateFamilyState && familyRef.current !== null) {
            setFamily(familyRef.current as FamilyUnitDto);
            familyRef.current = null;
          }
          // Alert the user about the failure
          alert('Failed to save changes. Reverting to the previous state.');
          // Call any custom onError handler passed in options
          restOptions.onError?.(error, variables, context);
        }
      });
      // Reset the pending vars and timer after executing the mutation
      pendingVarsRef.current = null;
      timerRef.current = null;
    }, debounceMs);
  };

  return { ...mutation, mutate: debouncedMutate };
}