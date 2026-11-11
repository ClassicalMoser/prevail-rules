import { createEmptyGameState } from '@factories';
import { createIssueCommandsPhaseState, createTestUnit } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRemainingUnitsForPlayer } from './getRemainingUnitsForPlayer';

describe('getRemainingUnitsForPlayer function', () => {
  /** Black holds initiative: black acts first, white second. Each has one unit to act. */
  function blackActsFirst() {
    const blackUnit = createTestUnit('black');
    const whiteUnit = createTestUnit('white');
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState(base, {
        remainingUnitsFirstPlayer: [blackUnit],
        remainingUnitsSecondPlayer: [whiteUnit],
      }),
    );
    return { blackUnit, state, whiteUnit };
  }

  it('reads the first player’s units for the player holding initiative', () => {
    const { blackUnit, state } = blackActsFirst();

    expect(getRemainingUnitsForPlayer(state, 'black')).toStrictEqual([
      blackUnit,
    ]);
  });

  it('reads the second player’s units for the other player', () => {
    const { state, whiteUnit } = blackActsFirst();

    expect(getRemainingUnitsForPlayer(state, 'white')).toStrictEqual([
      whiteUnit,
    ]);
  });

  it('throws when the Issue Commands phase is not under way', () => {
    const state = createEmptyGameState('standard');

    expect(() => getRemainingUnitsForPlayer(state, 'black')).toThrow(
      'No current phase state found',
    );
  });
});
