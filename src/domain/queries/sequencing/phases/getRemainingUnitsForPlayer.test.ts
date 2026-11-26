import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { createIssueCommandsPhaseState, createTestUnit } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRemainingUnitsForPlayer } from './getRemainingUnitsForPlayer';

/** The units each player's order has still to move or shoot (§4.3.9). */
describe('getRemainingUnitsForPlayer function', () => {
  /** Black holds initiative: black acts first, white second. Each has one unit to act. */
  function blackActsFirst(): {
    blackUnit: UnitInstance;
    state: GameState;
    whiteUnit: UnitInstance;
  } {
    const blackUnit = createTestUnit('black');
    const whiteUnit = createTestUnit('white');
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const state = updatePhaseState(
      base,
      createIssueCommandsPhaseState({
        remainingUnitsFirstPlayer: [blackUnit],
        remainingUnitsSecondPlayer: [whiteUnit],
      }),
    );
    return { blackUnit, state, whiteUnit };
  }

  it('reads the first player’s units for the player holding initiative', () => {
    const { blackUnit, state } = blackActsFirst();

    // Black orders first, so black's units are the first player's.
    expect(getRemainingUnitsForPlayer(state, 'black')).toStrictEqual([
      blackUnit,
    ]);
  });

  it('reads the second player’s units for the other player', () => {
    const { state, whiteUnit } = blackActsFirst();

    // White orders second, so white's units are the second player's.
    expect(getRemainingUnitsForPlayer(state, 'white')).toStrictEqual([
      whiteUnit,
    ]);
  });

  it('throws when the Issue Commands phase is not under way', () => {
    // Before the round begins, no orders are being carried out.
    const state = createEmptyGameState('standard');

    // Asking for units still to act is out of turn.
    expect(() => getRemainingUnitsForPlayer(state, 'black')).toThrow(
      'No current phase state found',
    );
  });
});
