import { createRallyResolutionState } from '@testing';

import { isAwaitingUnitSupport } from './isAwaitingUnitSupport';

/** The support check comes right after the burn, and only once (§10.4.1). */
describe('isAwaitingUnitSupport function', () => {
  it('holds once the burn is done and the lost-support list is still pending', () => {
    // The cards are back in hand, and the check is still to make.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: 'pending',
    });

    // This is the moment to assign support.
    expect(isAwaitingUnitSupport(rally)).toBe(true);
  });

  it('does not hold before the rally has been burnt', () => {
    // The player chose to rally, but the cards are not back yet.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: false,
    });

    // Too early to check support.
    expect(isAwaitingUnitSupport(rally)).toBe(false);
  });

  it('does not hold once the lost-support list is settled', () => {
    // Support is assigned once.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: [],
    });

    // The check is already made.
    expect(isAwaitingUnitSupport(rally)).toBe(false);
  });
});
