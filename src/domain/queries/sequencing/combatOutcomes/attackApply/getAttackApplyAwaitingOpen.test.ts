import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getAttackApplyAwaitingOpen } from './getAttackApplyAwaitingOpen';

/** An attack that reached the defender's Rout (§7.5.3). */
const routReached = {
  unitRetreated: false,
  unitReversed: false,
  unitRouted: true,
};

/**
 * A retreat, reverse or rout opens on the apply whose slot for that stage is
 * still waiting: a shot's only apply, or in a melee the first in the order the
 * attacks take effect, the second player's unit first (§7.5.6).
 */
describe('getAttackApplyAwaitingOpen function', () => {
  /** A melee with Black holding the initiative and both applies as given. */
  function meleeWith(blackRouts: boolean, whiteRouts: boolean) {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const nothing = { ...routReached, unitRouted: false };
    const black = createTestUnit('black', { attack: 2 });
    const white = createTestUnit('white', { attack: 2 });
    const blackApply = createAttackApplyState(
      black,
      blackRouts ? routReached : nothing,
    );
    const whiteApply = createAttackApplyState(
      white,
      whiteRouts ? routReached : nothing,
    );
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: createMeleeResolutionState(empty, {
          firstPlayerAttackApplyState: blackApply,
          secondPlayerAttackApplyState: whiteApply,
        }),
      }),
    );
    return { blackApply, state, whiteApply };
  }

  it('opens on a shot’s only apply', () => {
    const empty = createEmptyGameState('standard');
    const target = createTestUnit('white', { attack: 2 });
    const apply = createAttackApplyState(target, routReached);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          empty,
          { attackApplyState: apply, defendingUnit: target },
        ),
      }),
    );

    expect(getAttackApplyAwaitingOpen(state, 'rout')).toBe(apply);
  });

  it('opens on the second player’s unit first when both are waiting', () => {
    // Black strikes first, so White's unit suffers first (§7.5.6).
    const { state, whiteApply } = meleeWith(true, true);

    expect(getAttackApplyAwaitingOpen(state, 'rout')).toBe(whiteApply);
  });

  it('opens on the first player’s unit when only it is waiting', () => {
    const { blackApply, state } = meleeWith(true, false);

    expect(getAttackApplyAwaitingOpen(state, 'rout')).toBe(blackApply);
  });

  it('throws when no apply has that stage waiting', () => {
    const { state } = meleeWith(false, false);

    expect(() => getAttackApplyAwaitingOpen(state, 'rout')).toThrow(
      'No pending rout on either melee attack apply',
    );
  });

  it('throws outside a shot or a melee', () => {
    expect(() =>
      getAttackApplyAwaitingOpen(createEmptyGameState('standard'), 'retreat'),
    ).toThrow('No current phase state found');
  });
});
