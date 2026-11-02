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

  it('throws when the rally rout is still pending', () => {
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
