import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMeleeResolutionReadyForAttackCalculation } from './getMeleeResolutionReadyForAttackCalculation';

/** Phase 4, fighting the melee this test built. */
function resolveMelee(
  empty: GameState,
  melee: MeleeResolutionState,
): GameState {
  const phase = createResolveMeleePhaseState(empty, {
    currentMeleeResolutionState: melee,
  });
  const fighting = updatePhaseState(empty, phase);
  return fighting;
}

/**
 * Both attack values are counted once both players have committed or refused,
 * and before either unit's results are written (§7.2.2). White holds the
 * initiative, as an empty game starts, so white is the first player.
 */
describe('getMeleeResolutionReadyForAttackCalculation function', () => {
  it('returns the melee once both have committed and no blow is counted', () => {
    // Both commitments are made, and both applies are still to be written.
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty);
    const state = resolveMelee(empty, melee);

    // The melee is ready for its attack values.
    expect(getMeleeResolutionReadyForAttackCalculation(state)).toBe(melee);
  });

  it('throws while the first player has still to commit', () => {
    // White has not answered, so nothing can be counted yet.
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      firstPlayerCommitment: { commitmentType: 'pending' },
    });
    const state = resolveMelee(empty, melee);

    // Counting now would skip white's card.
    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'First player commitment is still pending',
    );
  });

  it('throws while the second player has still to commit', () => {
    // White has committed; black has not answered.
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      secondPlayerCommitment: { commitmentType: 'pending' },
    });
    const state = resolveMelee(empty, melee);

    // Counting now would skip black's card.
    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Second player commitment is still pending',
    );
  });

  it("throws once the blow on the first player's unit is written", () => {
    // The results against white's unit are already recorded.
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('white'),
      ),
    });
    const state = resolveMelee(empty, melee);

    // The attack values were counted already, and are not counted twice.
    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Attack apply states already exist',
    );
  });

  it("throws once the blow on the second player's unit is written", () => {
    // The results against black's unit are already recorded.
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      attackOnSecondPlayerApplyState: createAttackApplyStateWithNothingDue(
        createTestUnit('black'),
      ),
    });
    const state = resolveMelee(empty, melee);

    // The attack values were counted already, and are not counted twice.
    expect(() => getMeleeResolutionReadyForAttackCalculation(state)).toThrow(
      'Attack apply states already exist',
    );
  });
});
