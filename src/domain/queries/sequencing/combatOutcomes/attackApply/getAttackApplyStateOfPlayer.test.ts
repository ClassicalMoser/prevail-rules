import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getAttackApplyStateOfPlayer } from './getAttackApplyStateOfPlayer';

/** An attack that reached none of the defender's thresholds. */
const nothingReached = {
  unitRetreated: false,
  unitReversed: false,
  unitRouted: false,
};

/**
 * A caller that knows whose unit it is about, and not what kind of attack is
 * being resolved, asks for that player's apply.
 */
describe('getAttackApplyStateOfPlayer function', () => {
  it('reads the one apply of a ranged attack, whoever is asked about', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    // Black shoots at White's unit, and the shot leaves one apply.
    const target = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyState(target, nothingReached);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState({
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          {
            attackApplyState: apply,
            defendingUnit: target,
          },
        ),
      }),
    );

    // A shot is one way (§7.4.4), so either player is answered with it.
    expect(getAttackApplyStateOfPlayer(state, 'white')).toBe(apply);
    expect(getAttackApplyStateOfPlayer(state, 'black')).toBe(apply);
  });

  it('reads the apply on a player’s own side of a melee', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    // Both units strike at once, so each has an apply of its own.
    const white = createTestUnit('white', { attack: 2 });
    const black = createTestUnit('black', { attack: 2 });
    const whiteApply = createAttackApplyState(white, nothingReached);
    const blackApply = createAttackApplyState(black, nothingReached);
    // Black holds the initiative here, so black's apply is the first.
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: createMeleeResolutionState(empty, {
          attackOnFirstPlayerApplyState: blackApply,
          attackOnSecondPlayerApplyState: whiteApply,
        }),
      }),
    );

    // Each player is answered with the apply on their own unit.
    expect(getAttackApplyStateOfPlayer(state, 'black')).toBe(blackApply);
    expect(getAttackApplyStateOfPlayer(state, 'white')).toBe(whiteApply);
  });

  it('throws in a phase that resolves no attack', () => {
    // Playing cards carries out no attack's results.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(() => getAttackApplyStateOfPlayer(state, 'white')).toThrow(
      'Attack apply state not available in phase: playCards',
    );
  });

  it('throws before the round has a phase', () => {
    // Setup has no phase, and so no attack.
    expect(() =>
      getAttackApplyStateOfPlayer(
        updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
        'white',
      ),
    ).toThrow('No current phase state found');
  });
});
