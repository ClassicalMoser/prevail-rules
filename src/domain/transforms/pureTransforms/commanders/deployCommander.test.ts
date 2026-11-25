import { createEmptyGameState } from '@factories';

import { defeatCommander } from './defeatCommander';
import { deployCommander } from './deployCommander';

/**
 * A side places its commander at deployment (§3.5.3): on the board and filed
 * there, in one write.
 */
describe('deployCommander function', () => {
  it('places the commander and files it where it stands', () => {
    // A new game: neither commander placed yet.
    const state = createEmptyGameState('standard');

    const deployed = deployCommander(state, 'white', 'L-5');

    // On L-5, and the index says so; black's is still waiting.
    expect(deployed.boardState.board['L-5']?.commanders).toStrictEqual([
      'white',
    ]);
    expect(deployed.index.commanders).toStrictEqual({
      black: 'reserved',
      white: 'L-5',
    });
  });

  it('throws for a commander already placed', () => {
    // White's commander is already on the board.
    const state = deployCommander(
      createEmptyGameState('standard'),
      'white',
      'L-5',
    );

    // A commander deploys once.
    expect(() => deployCommander(state, 'white', 'L-6')).toThrow(
      'The white commander has already been placed',
    );
  });

  it('throws for a commander already lost', () => {
    // White's commander stood on L-5 and fell there (§4.2.8).
    const state = defeatCommander(
      deployCommander(createEmptyGameState('standard'), 'white', 'L-5'),
      'white',
    );

    // A fallen commander does not come back.
    expect(() => deployCommander(state, 'white', 'L-6')).toThrow(
      'The white commander has already been placed',
    );
  });
});
