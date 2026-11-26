import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getAttackApplyToClose } from './getAttackApplyToClose';

/** An attack that reached none of the defender's thresholds. */
const nothingReached = {
  unitRetreated: false,
  unitReversed: false,
  unitRouted: false,
};

/**
 * `completeAttackApply` closes one apply: a shot's only one, or the next of a
 * melee's two in the order the attacks take effect (§7.5.6).
 */
describe('getAttackApplyToClose function', () => {
  it('reads the one apply of a shot', () => {
    const empty = createEmptyGameState('standard');
    // The shot's target has had all its results carried out.
    const target = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyState(target, nothingReached);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState({
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          { attackApplyState: apply, defendingUnit: target },
        ),
      }),
    );

    expect(getAttackApplyToClose(state)).toBe(apply);
  });

  it('reads the second player’s apply of a melee first, and the first player’s once it is closed', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const white = createTestUnit('white', { attack: 2 });
    const black = createTestUnit('black', { attack: 2 });
    const blackApply = createAttackApplyState(black, nothingReached);
    const whiteApply = createAttackApplyState(white, nothingReached);
    // Black holds the initiative here, so black's attack takes effect first and
    // white's unit, the second player's, suffers it first (§7.5.6).
    const meleeWith = (secondApplyDone: boolean) =>
      updatePhaseState(
        empty,
        createResolveMeleePhaseState(empty, {
          currentMeleeResolutionState: createMeleeResolutionState(empty, {
            attackOnFirstPlayerApplyState: blackApply,
            attackOnSecondPlayerApplyState: {
              ...whiteApply,
              completed: secondApplyDone,
            },
          }),
        }),
      );

    expect(getAttackApplyToClose(meleeWith(false))).toStrictEqual(whiteApply);
    expect(getAttackApplyToClose(meleeWith(true))).toBe(blackApply);
  });

  it('throws while one side of the melee is not yet written', () => {
    // Both units' applies are written before either closes (§7.5.6); White's
    // blow on Black's unit is not yet measured here.
    const empty = createEmptyGameState('standard');
    const white = createTestUnit('white', { attack: 2 });
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: createMeleeResolutionState(empty, {
          attackOnFirstPlayerApplyState: createAttackApplyState(
            white,
            nothingReached,
          ),
          attackOnSecondPlayerApplyState: 'pending',
        }),
      }),
    );

    expect(() => getAttackApplyToClose(state)).toThrow(
      'A melee attack apply has not been written yet, so none can close',
    );
  });

  it('throws when every apply of the melee is already closed', () => {
    const empty = createEmptyGameState('standard');
    // Both units' results are carried out and closed off.
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
          attackOnFirstPlayerApplyState: closed(black),
          attackOnSecondPlayerApplyState: closed(white),
        }),
      }),
    );

    expect(() => getAttackApplyToClose(state)).toThrow(
      'No incomplete attack apply state found in melee resolution',
    );
  });

  it('throws in a phase that resolves no attack', () => {
    // Playing cards carries out no attack's results.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(() => getAttackApplyToClose(state)).toThrow(
      'completeAttackApply not expected in phase: playCards',
    );
  });

  it('throws before the round has a phase', () => {
    // Setup has no phase, and so no attack.
    expect(() =>
      getAttackApplyToClose(createEmptyGameState('standard')),
    ).toThrow('No current phase state found');
  });
});
