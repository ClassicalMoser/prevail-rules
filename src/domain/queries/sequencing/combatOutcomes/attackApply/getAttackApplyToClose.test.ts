import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getAttackApplyToClose } from './getAttackApplyToClose';

/** An attack that reached none of the defender's thresholds. */
const nothingReached = {
  unitRetreated: false,
  unitReversed: false,
  unitRouted: false,
};

/**
 * `completeAttackApply` closes one apply: a shot's only one, or the next of a
 * melee's two in the order the blows take effect (§7.5.6).
 */
describe('getAttackApplyToClose function', () => {
  it('reads the one apply of a shot', () => {
    const empty = createEmptyGameState('standard');
    const target = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyState(target, nothingReached);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          { attackApplyState: apply, defendingUnit: target },
        ),
      }),
    );

    expect(getAttackApplyToClose(state)).toBe(apply);
  });

  it('reads the second player’s apply of a melee first, and the first player’s once it is closed', () => {
    const empty = createEmptyGameState('standard');
    const white = createTestUnit('white', { attack: 2 });
    const black = createTestUnit('black', { attack: 2 });
    const blackApply = createAttackApplyState(black, nothingReached);
    const whiteApply = createAttackApplyState(white, nothingReached);
    // Black holds initiative in an empty game, so black's blow lands first and
    // white's unit, the second player's, suffers it first (§7.5.6).
    const meleeWith = (secondApplyDone: boolean) =>
      updatePhaseState(
        empty,
        createResolveMeleePhaseState(empty, {
          currentMeleeResolutionState: createMeleeResolutionState(empty, {
            firstPlayerAttackApplyState: blackApply,
            secondPlayerAttackApplyState: {
              ...whiteApply,
              completed: secondApplyDone,
            },
          }),
        }),
      );

    expect(getAttackApplyToClose(meleeWith(false))).toStrictEqual(whiteApply);
    expect(getAttackApplyToClose(meleeWith(true))).toBe(blackApply);
  });

  it('throws when every apply of the melee is already closed', () => {
    const empty = createEmptyGameState('standard');
    const white = createTestUnit('white', { attack: 2 });
    const black = createTestUnit('black', { attack: 2 });
    const closed = (unit: typeof white) => ({
      ...createAttackApplyState(unit, nothingReached),
      completed: true,
    });
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: createMeleeResolutionState(empty, {
          firstPlayerAttackApplyState: closed(black),
          secondPlayerAttackApplyState: closed(white),
        }),
      }),
    );

    expect(() => getAttackApplyToClose(state)).toThrow(
      'No incomplete attack apply state found in melee resolution',
    );
  });

  it('throws outside a shot or a melee', () => {
    expect(() =>
      getAttackApplyToClose(createEmptyGameState('standard')),
    ).toThrow('No current phase state found');
  });
});
