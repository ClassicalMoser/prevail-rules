import {
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';

import { getRoutStateFromRally } from './getRoutStateFromRally';

/**
 * Unwraps the rout stored on a rally the caller already holds.
 */
describe('getRoutStateFromRally function', () => {
  it('returns the rout on the rally slice', () => {
    // The support check left a unit without a place, and it routs.
    const rout = createRoutState(
      'black',
      createTestUnit('black', { attack: 2 }),
      {
        numberToDiscard: 1,
      },
    );
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: rout,
    });

    expect(getRoutStateFromRally(rally)).toBe(rout);
  });

  it('answers bypassed when the support check routed nobody', () => {
    // Every unit found a place, so the rally costs no Morale (§10.4.6).
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: 'bypassed',
    });

    expect(getRoutStateFromRally(rally)).toBe('bypassed');
  });

  it('throws when the rally rout is still pending', () => {
    // The rally is taken but its support check is not yet made.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: 'pending',
    });

    expect(() => getRoutStateFromRally(rally)).toThrow(
      'No rout state found in rally resolution state',
    );
  });
});
