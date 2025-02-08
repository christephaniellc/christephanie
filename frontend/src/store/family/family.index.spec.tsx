import {familyState, familyGuestsStates, guestSelector, useUpdateFamilyGuest} from './index';
import {mockFamilyUnitDto} from "@/types/mockResponses";
import {RecoilRoot, RecoilState, snapshot_UNSTABLE} from "recoil";
import {useEffect} from "react";
import { FamilyUnitDto, GuestDto, InvitationResponseEnum } from '@/types/api';
import {render} from "@testing-library/react";
import {RecoilObserver} from "@/utils/RecoilObserver";


describe('familyGuestsStates selector', () => {
  it('should return the correct family guests states', () => {
    // Create a "testSnapshot" and initialize `familyState` with `mockFamilyUnitDto`.
    const testSnapshot = snapshot_UNSTABLE(({ set }) => {
      set(familyState, mockFamilyUnitDto);
    });

    // Evaluate the selector in that snapshot.
    const loadable = testSnapshot.getLoadable(familyGuestsStates);
    const familyGuests = loadable.valueOrThrow();

    // Now you can assert whatever you want about the resulting value:
    expect(familyGuests!.guests.length).toEqual(2);
    expect(familyGuests!.nobodyComing).toEqual(false);
    expect(familyGuests!.callByLastNames).toEqual('Stublers & Sikorras');
    expect(familyGuests!.attendingLastNames).toEqual(['Stubler']);
  });
});

describe('guestSelector selector', () => {
  it('should return the correct guest', () => {
    // Create a "testSnapshot" and initialize `familyState` with `mockFamilyUnitDto`.
    const testSnapshot = snapshot_UNSTABLE(({ set }) => {
      set(familyState, mockFamilyUnitDto);
    });

    // Evaluate the selector in that snapshot.
    const loadable = testSnapshot.getLoadable(guestSelector('guest-001'));
    const guest = loadable.valueOrThrow();

    // Now you can assert whatever you want about the resulting value:
    expect(guest?.firstName).toEqual('Steph');
    expect(guest?.lastName).toEqual('Stubler');
  });

  describe('guestSelector (with setter)', () => {
    it('should update an existing guest', () => {
      // 1) Create a base snapshot with the initial family data
      const baseSnapshot = snapshot_UNSTABLE(({ set }) => {
        set(familyState, mockFamilyUnitDto);
      });

      // 2) Modify that snapshot by setting the selector
      const updatedSnapshot = baseSnapshot.map(({ set }) => {
        // We update the guest with ID 'guest-001' by changing firstName
        set(guestSelector('guest-001'), { firstName: 'UpdatedName' });
      });

      // 3) Now read the updated value out of the snapshot
      const loadable = updatedSnapshot.getLoadable(guestSelector('guest-001'));
      const updatedGuest = loadable.valueOrThrow();

      // 4) Assertions
      expect(updatedGuest).not.toBeNull();
      expect(updatedGuest?.firstName).toEqual('UpdatedName');

      // Check if other fields remain intact:
      expect(updatedGuest?.lastName).toEqual('Stubler');

      // And if you want, confirm that the data is also reflected in familyState:
      const updatedFamily = updatedSnapshot.getLoadable(familyState).valueOrThrow();
      const sameGuest = updatedFamily?.guests!.find((value) => value.guestId === 'guest-001');
      expect(sameGuest?.firstName).toEqual('UpdatedName');
    });

    it('should do nothing if the family/guests is null or undefined', () => {
      // 1) Create a snapshot WITHOUT setting familyState => familyState = null
      const baseSnapshot = snapshot_UNSTABLE();

      // 2) Attempt to set the guest in that snapshot
      const updatedSnapshot = baseSnapshot.map(({ set }) => {
        set(guestSelector('guest-999'), { firstName: 'DoesNotMatter' });
      });

      // 3) No error should occur, but obviously no data changes
      const loadable = updatedSnapshot.getLoadable(guestSelector('guest-999'));
      expect(loadable.valueOrThrow()).toBeNull();
    });
  });
});

describe('useUpdateFamilyGuest', () => {
  it('should update the familyState with the new guest data', () => {
    // 1) Spy/callback to track changes in familyState
    const onChange = jest.fn();

    // 2) Test component that calls our hook
    function TestComponent() {
      const { updateInvitation } = useUpdateFamilyGuest('guest-001');

      // We’ll update the guest’s invitation as soon as this component mounts
      useEffect(() => {
        updateInvitation(InvitationResponseEnum.Declined);
      }, [updateInvitation]);

      return null;
    }

    // 3) Render with a RecoilRoot. Initialize familyState with mock data.
    render(
      <RecoilRoot
        initializeState={({ set }) => {
          set(familyState, mockFamilyUnitDto);
        }}
      >
        {/* Observe changes to familyState and call onChange each time */}
        <RecoilObserver node={familyState as RecoilState<FamilyUnitDto>} onChange={onChange} />

        {/* Our test component uses the custom hook */}
        <TestComponent />
      </RecoilRoot>
    );

    // 4) Assertions on the callback
    // The first call is the initial load, the second call is after we update
    expect(onChange).toHaveBeenCalledTimes(2);

    // The updated value of familyState is in the second call:
    const updatedFamily = onChange.mock.calls[1][0];
    const updatedGuest = updatedFamily.guests?.find(
      (g: GuestDto) => g.guestId === 'guest-001'
    );

    // Confirm the RSVP has changed to "Declined"
    expect(updatedGuest?.rsvp?.invitationResponse).toBe(InvitationResponseEnum.Declined);
  });
});