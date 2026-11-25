import type { GameState } from '@game';
import {
  createAttackApplyStateWithNothingDue,
  createGameStateResolvingCommand,
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateCompleteAttackApplyEvent } from './generateCompleteAttackApplyEvent';

/** White's unit, the first player's, since White holds the initiative. */
const whiteUnit = createTestUnit('white');

/** Black's unit, the second player's. */
const blackUnit = createTestUnit('black');

/**
 * A melee on E-5 between `whiteUnit` and `blackUnit` whose blows reached
 * nothing, with each unit's apply closed or not as the case says. White holds
 * the initiative, as a new game starts, so its unit's apply is the first
 * player's and closes last (§7.5.6).
 *
 * @param closed - Whether each colour's unit has had its apply closed
 * @returns The game, fighting that melee
 */
function meleeWithApplies(closed: {
  white: boolean;
  black: boolean;
}): GameState {
  // The two units locked together on E-5.
  const engaged = createGameStateWithEngagedUnits(whiteUnit, blackUnit);

  // Each unit's apply, written by the melee's measure and closed or not.
  const melee = createMeleeResolutionState(engaged, {
    attackOnFirstPlayerApplyState: createAttackApplyStateWithNothingDue(
      whiteUnit,
      { completed: closed.white },
    ),
    attackOnSecondPlayerApplyState: createAttackApplyStateWithNothingDue(
      blackUnit,
      { completed: closed.black },
    ),
  });

  // Phase 4, fighting that melee.
  const fighting = updatePhaseState(
    engaged,
    createResolveMeleePhaseState(engaged, {
      currentMeleeResolutionState: melee,
    }),
  );
  return fighting;
}

/**
 * `completeAttackApply` is the bookkeeping tick after both sides have committed in ranged
 * or after each melee defender finishes their apply substep. Payload names attack type and
 * which player’s apply just completed (melee uses initiative order when both are pending).
 */
// TODO(misleading): the event carries nothing; the state names which apply
// closes (`getAttackApplyToClose`). It is owed once an apply's results are
// carried out, not once both sides have committed. Settle by saying so.
describe('generateCompleteAttackApplyEvent function', () => {
  it('names the effect for a shot whose apply is waiting to close, and carries nothing', () => {
    // Black's unit has shot White's from C-5, and the shot reached nothing, so
    // its apply has nothing left to carry out.
    const shooter = createTestUnit('black', { attack: 2, range: 2 });
    const board = createGameStateWithUnits([
      placed(shooter, 'C-5', 'south'),
      placed(whiteUnit, 'E-5', 'north'),
    ]);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState: createAttackApplyStateWithNothingDue(whiteUnit),
      attackingUnit: shooter,
      defendingUnit: whiteUnit,
    });
    const state = createGameStateResolvingCommand(shot, board);

    // The close names no apply: the shot has only the one.
    expect(generateCompleteAttackApplyEvent(state)).toStrictEqual({
      effectType: 'completeAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('names the same effect for a melee with an apply left to close', () => {
    // Neither unit's apply is closed yet.
    const state = meleeWithApplies({ black: false, white: false });

    // The same effect, which the state will point at Black's apply first.
    expect(generateCompleteAttackApplyEvent(state)).toStrictEqual({
      effectType: 'completeAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('names it again for the melee’s other apply once the first is closed', () => {
    // Black's unit, the second player's, took its results first and its apply
    // is closed; White's is left.
    const state = meleeWithApplies({ black: true, white: false });

    // Still the same effect: the event never says which apply it closes.
    expect(generateCompleteAttackApplyEvent(state)).toStrictEqual({
      effectType: 'completeAttackApply',
      eventType: 'gameEffect',
    });
  });

  it('refuses once every apply of the melee is closed', () => {
    // Both units' applies are closed: the melee waits only to end.
    const state = meleeWithApplies({ black: true, white: true });

    // No apply is left, so the close is not owed.
    expect(() => generateCompleteAttackApplyEvent(state)).toThrow(
      'No incomplete attack apply state found in melee resolution',
    );
  });
});
