import type { GameState } from '@game';
import {
  createGameStateWithEngagedUnits,
  createGameStateWithSingleUnit,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMeleeCombatants } from './getMeleeCombatants';

/** Phase 4, fighting the melee in E-5 on this game's board. */
function fightingInE5(game: GameState): GameState {
  const melee = createMeleeResolutionState(game, { location: 'E-5' });
  const phase = createResolveMeleePhaseState(game, {
    currentMeleeResolutionState: melee,
  });
  const fighting = updatePhaseState(game, phase);
  return fighting;
}

/** A melee is fought by the two units sharing its space (§7.2.1). */
describe('getMeleeCombatants function', () => {
  it("reads both units in the melee's space, each where it stands", () => {
    // White's unit faces north in E-5; black's moved in and faces it.
    const white = createTestUnit('white');
    const black = createTestUnit('black');
    const state = fightingInE5(
      createGameStateWithEngagedUnits(white, black, 'E-5', 'north'),
    );

    // Each side's unit, with the facing the board gives it.
    expect(getMeleeCombatants(state)).toStrictEqual({
      black: {
        placement: { coordinate: 'E-5', facing: 'south' },
        unit: black,
      },
      white: {
        placement: { coordinate: 'E-5', facing: 'north' },
        unit: white,
      },
    });
  });

  it('throws when no black unit stands in the space', () => {
    // Only white's unit is in E-5, which no melee can be fought in.
    const state = fightingInE5(createGameStateWithSingleUnit('E-5', 'white'));

    // The state is at fault: a melee needs both units.
    expect(() => getMeleeCombatants(state)).toThrow('Units not found on board');
  });

  it('throws when no white unit stands in the space', () => {
    // Only black's unit is in E-5.
    const state = fightingInE5(createGameStateWithSingleUnit('E-5', 'black'));

    // The state is at fault: a melee needs both units.
    expect(() => getMeleeCombatants(state)).toThrow('Units not found on board');
  });
});
