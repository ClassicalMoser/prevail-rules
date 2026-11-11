import { createEmptyGameState } from '@factories';
import { createIssueCommandsPhaseState, createTestCommand } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRemainingCommandsForPlayer } from './getRemainingCommandsForPlayer';

describe('getRemainingCommandsForPlayer function', () => {
  /** White holds initiative: white gives its orders first, black second. */
  function whiteGivesOrdersFirst() {
    const whiteOrder = createTestCommand({ number: 1 });
    const blackOrder = createTestCommand({ number: 2 });
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        remainingCommandsFirstPlayer: [whiteOrder],
        remainingCommandsSecondPlayer: [blackOrder],
      }),
    );
    return { blackOrder, state, whiteOrder };
  }

  it('reads the first player’s orders for the player holding initiative', () => {
    const { state, whiteOrder } = whiteGivesOrdersFirst();

    expect(getRemainingCommandsForPlayer(state, 'white')).toStrictEqual([
      whiteOrder,
    ]);
  });

  it('reads the second player’s orders for the other player', () => {
    const { blackOrder, state } = whiteGivesOrdersFirst();

    expect(getRemainingCommandsForPlayer(state, 'black')).toStrictEqual([
      blackOrder,
    ]);
  });

  it('throws when the Issue Commands phase is not under way', () => {
    const state = createEmptyGameState('standard');

    expect(() => getRemainingCommandsForPlayer(state, 'white')).toThrow(
      'No current phase state found',
    );
  });
});
