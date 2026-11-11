import { createRallyResolutionState } from '@testing';

import { isAwaitingUnitSupport } from './isAwaitingUnitSupport';

describe('isAwaitingUnitSupport function', () => {
  it('holds once the burn is done and the lost-support list is still pending', () => {
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: 'pending',
    });

    expect(isAwaitingUnitSupport(rally)).toBe(true);
  });

  it('does not hold before the rally has been burnt', () => {
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: false,
    });

    expect(isAwaitingUnitSupport(rally)).toBe(false);
  });

  it('does not hold once the lost-support list is settled', () => {
    // Support is assigned once.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: [],
    });

    expect(isAwaitingUnitSupport(rally)).toBe(false);
  });
});
