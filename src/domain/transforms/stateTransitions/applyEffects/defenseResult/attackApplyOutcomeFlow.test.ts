import { throwIfBypassed } from '@utils';
import type {
  OpenRetreatFromAttackApplyEvent,
  OpenReverseFromAttackApplyEvent,
  ResolveRetreatEvent,
  TriggerRoutFromRetreatEvent,
} from '@events';
import type { GameState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  getRangedAttackApplyState,
  getPositionOfUnit,
  getRetreatStateFromAttackApply,
  getReverseStateFromAttackApply,
} from '@queries';
import {
  createAttackApplyStateWithRetreatAndReverse,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyOpenRetreatFromAttackApplyEvent } from './applyOpenRetreatFromAttackApplyEvent';
import { applyOpenReverseFromAttackApplyEvent } from './applyOpenReverseFromAttackApplyEvent';
import { applyResolveRetreatEvent } from './applyResolveRetreatEvent';
import { applyTriggerRoutFromRetreatEvent } from './applyTriggerRoutFromRetreatEvent';

/**
 * Facts the attack-outcome cleanup made reachable: a retreat then a reverse on
 * the square the retreat left the unit on, and a failed retreat that routs and
 * bypasses reverse.
 */
describe('attack apply outcome flow', () => {
  /**
   * IssueCommands with a ranged attack apply already measured for the defender.
   * Stand-in enough to open and resolve the apply's outcome steps.
   */
  function rangedApplyShell(
    defendingUnit: ReturnType<typeof createTestUnit>,
    attackApply: ReturnType<typeof createAttackApplyState>,
  ): GameState {
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const empty = createEmptyGameState('standard');
    const withBoard = {
      ...empty,
      boardState: addUnitToBoard(empty.boardState, unitWithPlacement),
    };
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  }

  it('after a retreat that also cleared reverse, the reverse opens on the square the retreat moved to', () => {
    // Both thresholds fell; the factory leaves both steps due and neither open.
    const defendingUnit = createTestUnit('white', { attack: 2, speed: 3 });
    const start = rangedApplyShell(
      defendingUnit,
      createAttackApplyState(defendingUnit, {
        unitRetreated: true,
        unitReversed: true,
        unitRouted: false,
      }),
    );

    // Open the retreat first — reverse waits until the unit has a new square.
    const openRetreat: OpenRetreatFromAttackApplyEvent = {
      attackResolutionContext: 'rangedAttack',
      effectType: 'openRetreatFromAttackApply',
      eventNumber: 0,
      eventType: 'gameEffect',
    };
    const withRetreatOpen = applyOpenRetreatFromAttackApplyEvent(
      openRetreat,
      start,
    );
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(
        getRangedAttackApplyState(withRetreatOpen),
      ),
      'the attack applies a retreat',
    );
    // The engine computed where this unit can go; this case picks one of them.
    expect(retreat.legalRetreatOptions.length).toBeGreaterThan(0);
    const chosen = retreat.legalRetreatOptions[0];

    const resolveRetreat: ResolveRetreatEvent = {
      effectType: 'resolveRetreat',
      eventNumber: 1,
      eventType: 'gameEffect',
      finalPosition: { placement: chosen.placement, unit: defendingUnit },
      path: chosen.path,
      startingPosition: retreat.retreatingUnit,
    };
    const afterRetreat = applyResolveRetreatEvent(
      resolveRetreat,
      withRetreatOpen,
    );

    // Reverse is still due after the retreat; open it from the square just reached.
    expect(getRangedAttackApplyState(afterRetreat).reverseState).toBe(
      'pending',
    );

    const openReverse: OpenReverseFromAttackApplyEvent = {
      attackResolutionContext: 'rangedAttack',
      effectType: 'openReverseFromAttackApply',
      eventNumber: 2,
      eventType: 'gameEffect',
    };
    const afterReverseOpen = applyOpenReverseFromAttackApplyEvent(
      openReverse,
      afterRetreat,
    );
    const reverse = throwIfBypassed(
      getReverseStateFromAttackApply(
        getRangedAttackApplyState(afterReverseOpen),
      ),
      'the attack applies a reverse',
    );
    // The reverse holds the unit by identity; its square is where the retreat left it.
    expect(reverse.reversingUnit).toBe(defendingUnit);
    expect(
      getPositionOfUnit(afterReverseOpen.boardState, reverse.reversingUnit),
    ).toStrictEqual(chosen.placement);
  });

  it('a retreat with nowhere to go that routs bypasses reverse on the apply', () => {
    // Both steps were due; nowhere to retreat means a rout instead of a reverse.
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(retreatingUnit, 'E-5', 'north');
    const attackApply = createAttackApplyStateWithRetreatAndReverse(
      unitWithPlacement,
      {
        retreatState: createRetreatState(unitWithPlacement, {
          legalRetreatOptions: [],
        }),
      },
    );
    expect(attackApply.reverseState).toBe('pending');
    const full = rangedApplyShell(retreatingUnit, attackApply);

    const event: TriggerRoutFromRetreatEvent = {
      effectType: 'triggerRoutFromRetreat',
      eventNumber: 0,
      eventType: 'gameEffect',
      retreatResolutionContext: 'rangedAttack',
    };
    const next = applyTriggerRoutFromRetreatEvent(event, full);
    expect(getRangedAttackApplyState(next).reverseState).toBe('bypassed');
  });
});
