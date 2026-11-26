import { createEmptyGameState } from '@factories';
import { createTestUnit } from '@testing/unitHelpers';
import { createRoutState } from './routState';

import { createCleanupPhaseStateWithRallyRout } from './cleanupPhaseStateWithRallyRout';

/**
 * The player holding the initiative rallies first, the other second
 * (§4.5.2), so a rout a rally caused sits in that player's slot.
 */
describe('createCleanupPhaseStateWithRallyRout function', () => {
  it('puts the rout on the first player’s rally when that player holds the initiative', () => {
    // White holds the initiative as a game starts, and owes the rout.
    const state = createEmptyGameState('standard');
    const rout = createRoutState('white', createTestUnit('white'));

    const phase = createCleanupPhaseStateWithRallyRout(state, rout);

    expect(phase.step).toBe('firstPlayerResolveRally');
    expect(phase.firstPlayerRallyResolutionState).toMatchObject({
      playerRallied: true,
      rallyResolved: true,
      routState: rout,
    });
    expect(phase.secondPlayerRallyResolutionState).toBe('pending');
  });

  it('puts the rout on the second player’s rally when the other side holds the initiative', () => {
    // White holds the initiative, and Black owes the rout.
    const state = createEmptyGameState('standard');
    const rout = createRoutState('black', createTestUnit('black'));

    const phase = createCleanupPhaseStateWithRallyRout(state, rout);

    expect(phase.step).toBe('secondPlayerResolveRally');
    expect(phase.secondPlayerRallyResolutionState).toMatchObject({
      routState: rout,
    });
    expect(phase.firstPlayerRallyResolutionState).toBe('pending');
  });
});
