import { createEmptyGameState } from '@factories';
import { deployCommander } from '@transforms';

import { findCommanderSpace } from './findCommanderSpace';

/**
 * Where a side's commander stands, read from the game's index. A commander
 * not yet placed at setup, or lost with a routing unit of its own (§4.2.8),
 * stands nowhere, and that is an ordinary answer.
 */
describe('findCommanderSpace function', () => {
  it('is the space the commander was placed on', () => {
    // White's commander deploys on E-5.
    const newGame = createEmptyGameState('standard');
    const state = deployCommander(newGame, 'white', 'E-5');

    // It stands there.
    expect(findCommanderSpace('white', state)).toBe('E-5');
  });

  it('is nowhere for a commander not yet placed', () => {
    // A new game, before setup places anyone.
    const state = createEmptyGameState('standard');

    // White's commander is still waiting in reserve.
    expect(findCommanderSpace('white', state)).toBeUndefined();
  });

  // TODO(composition): no case pins the fallen commander, so the 'lost'
  // check could be dropped unnoticed. `withLostCommander` falls through
  // `defeatCommander`, which asks `getCommanderSpace` and so this subject,
  // and the self-proof check refuses it. Settle with a fixture that files a
  // lost commander without asking where it stood.
});
