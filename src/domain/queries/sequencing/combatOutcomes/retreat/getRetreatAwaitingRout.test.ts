import { createEmptyGameState } from '@factories';

import { getRetreatAwaitingRout } from './getRetreatAwaitingRout';

/**
 * A retreat with nowhere to go turns into a rout (§9.1.6); asking for the one
 * waiting to, when none is, is a fault.
 */
describe('getRetreatAwaitingRout function', () => {
  it('throws when no retreat is waiting to turn into a rout', () => {
    expect(() =>
      getRetreatAwaitingRout(createEmptyGameState('standard')),
    ).toThrow('No retreat with nowhere to go is waiting for its rout');
  });
});
