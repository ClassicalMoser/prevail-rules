import type { AttackResult } from '@entities';
import type { AttackApplyState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getAttackApplyAwaitingOpen } from './getAttackApplyAwaitingOpen';

/** An attack that reached the defender's Rout and nothing else. */
const routReached: AttackResult = {
  unitRetreated: false,
  unitReversed: false,
  unitRouted: true,
};

/** An attack that reached the defender's Retreat and nothing else. */
const retreatReached: AttackResult = {
  unitRetreated: true,
  unitReversed: false,
  unitRouted: false,
};

/** An attack that reached the defender's Reverse and nothing else. */
const reverseReached: AttackResult = {
  unitRetreated: false,
  unitReversed: true,
  unitRouted: false,
};

/** An attack that reached none of the defender's thresholds. */
const nothingReached: AttackResult = {
  unitRetreated: false,
  unitReversed: false,
  unitRouted: false,
};

/**
 * A retreat, reverse or rout opens on the apply whose slot for that stage is
 * still waiting: a shot's only apply, or in a melee the first in the order the
 * attacks take effect, the second player's unit first (§7.5.6).
 */
describe('getAttackApplyAwaitingOpen function', () => {
  /**
   * A melee with Black holding the initiative, each unit's apply built from
   * the thresholds the other's blow reached.
   */
  function meleeWith(blackResult: AttackResult, whiteResult: AttackResult) {
    // Black strikes first, so White's unit is the second player's.
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const black = createTestUnit('black', { attack: 2 });
    const white = createTestUnit('white', { attack: 2 });
    // Each slot is due exactly the results its unit's thresholds gave.
    const blackApply = createAttackApplyState(black, blackResult);
    const whiteApply = createAttackApplyState(white, whiteResult);
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: createMeleeResolutionState(empty, {
          attackOnFirstPlayerApplyState: blackApply,
          attackOnSecondPlayerApplyState: whiteApply,
        }),
      }),
    );
    return { blackApply, state, whiteApply };
  }

  /** A shot whose target's apply is the one given. */
  function shotWith(apply: AttackApplyState) {
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          { attackApplyState: apply, defendingUnit: apply.defendingUnit },
        ),
      }),
    );
    return state;
  }

  it('opens on a shot’s only apply', () => {
    // The shot reached the target's Rout, so its rout is waiting.
    const target = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyState(target, routReached);

    expect(getAttackApplyAwaitingOpen(shotWith(apply), 'rout')).toBe(apply);
  });

  it('throws when the shot’s apply has nothing waiting at that stage', () => {
    // The shot reached the Rout only, so no retreat is due to open.
    const target = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyState(target, routReached);

    expect(() =>
      getAttackApplyAwaitingOpen(shotWith(apply), 'retreat'),
    ).toThrow('The retreat is not pending on the ranged attack apply');
  });

  it('opens on the second player’s unit first when both are waiting', () => {
    // Black strikes first, so White's unit suffers first (§7.5.6).
    const { state, whiteApply } = meleeWith(routReached, routReached);

    expect(getAttackApplyAwaitingOpen(state, 'rout')).toBe(whiteApply);
  });

  it('opens on the first player’s unit when only it is waiting', () => {
    // Only Black's unit was broken, so it is the only rout to open.
    const { blackApply, state } = meleeWith(routReached, nothingReached);

    expect(getAttackApplyAwaitingOpen(state, 'rout')).toBe(blackApply);
  });

  it('reads each stage from its own slot', () => {
    // White's unit was driven back and Black's was shaken, so each stage has
    // one unit waiting, and a different one.
    const { blackApply, state, whiteApply } = meleeWith(
      reverseReached,
      retreatReached,
    );

    // The retreat opens on White's unit and the reverse on Black's.
    expect(getAttackApplyAwaitingOpen(state, 'retreat')).toBe(whiteApply);
    expect(getAttackApplyAwaitingOpen(state, 'reverse')).toBe(blackApply);
  });

  it('throws when no apply has that stage waiting', () => {
    // Neither blow reached anything, so no rout is due.
    const { state } = meleeWith(nothingReached, nothingReached);

    expect(() => getAttackApplyAwaitingOpen(state, 'rout')).toThrow(
      'No pending rout on either melee attack apply',
    );
  });

  it('throws before the round has a phase', () => {
    // Setup has no phase, and so no attack.
    expect(() =>
      getAttackApplyAwaitingOpen(createEmptyGameState('standard'), 'retreat'),
    ).toThrow('No current phase state found');
  });

  it('throws in a phase that resolves no attack', () => {
    // Playing cards carries out no attack's results.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(() => getAttackApplyAwaitingOpen(state, 'retreat')).toThrow(
      'Attack-apply retreat open not expected in phase: playCards',
    );
  });

  it('throws on a stage the game does not have', () => {
    // An attack's results come in three stages and no other.
    const { state } = meleeWith(routReached, routReached);

    // A stage outside the three, to reach the exhaustive guard.
    const unknownStage = 'charge' as never; // The type forbids any other stage.
    expect(() => getAttackApplyAwaitingOpen(state, unknownStage)).toThrow(
      'Unknown attack apply stage: charge',
    );
  });
});
