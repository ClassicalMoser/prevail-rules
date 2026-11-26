import { throwIfBypassed } from '@utils';
import type {
  OpenReverseFromAttackApplyEvent,
  ResolveRetreatEvent,
} from '@events';
import { createAttackApplyState } from '@factories';
import { generateEventFromProcedure } from '@procedures';
import {
  getRangedAttackApplyState,
  getPositionOfUnit,
  getRetreatStateFromAttackApply,
  getReverseStateFromAttackApply,
} from '@queries';
import {
  createGameStateWithUnits,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyOpenRetreatFromAttackApplyEvent } from './applyOpenRetreatFromAttackApplyEvent';
import { applyOpenReverseFromAttackApplyEvent } from './applyOpenReverseFromAttackApplyEvent';
import { applyResolveRetreatEvent } from './applyResolveRetreatEvent';

/**
 * Facts the attack-outcome cleanup made reachable: a retreat then a reverse on
 * the square the retreat left the unit on, and a failed retreat that routs and
 * bypasses reverse.
 *
 * The second fact is stated with the apply that carries it out, in the
 * `applyTriggerRoutFromRetreatEvent function` spec ("rout supersedes later
 * results"); this spec keeps the first, which runs across three applies.
 */
describe('attack apply outcome flow', () => {
  it('after a retreat that also cleared reverse, the reverse opens on the square the retreat moved to', () => {
    // White's unit on E-5 facing north, shot by Black's shooter in front of
    // it on D-5. Any unit will do: on open ground its one retreat is a step
    // straight back.
    const defendingUnit = createTestUnit('white');
    const shooter = createTestUnit('black', { range: 1 });
    const base = createGameStateWithUnits([
      placed(defendingUnit, 'E-5', 'north'),
      placed(shooter, 'D-5', 'south'),
    ]);

    // Both thresholds fell; the factory leaves both steps due and neither open.
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: createAttackApplyState(defendingUnit, {
        unitRetreated: true,
        unitReversed: true,
        unitRouted: false,
      }),
      attackingUnit: shooter,
      defendingUnit,
    });
    // Phase 3 with that shot under way, built from the authoritative game
    // the procedure below needs.
    const phase = createIssueCommandsPhaseState({
      currentCommandResolutionState: shot,
    });
    const start = updatePhaseState(base, phase);

    // Open the retreat first — reverse waits until the unit has a new square.
    // Its procedure works out where the unit may go.
    const openRetreat = generateEventFromProcedure(
      start,
      'openRetreatFromAttackApply',
      { nextFloat: () => 0 },
    );
    if (openRetreat.effectType !== 'openRetreatFromAttackApply') {
      throw new Error('Expected the open-retreat effect');
    }
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
    // The procedure found the way back for this unit on an empty board: one
    // step straight back. This case takes it.
    expect(retreat.legalRetreatPaths).toStrictEqual([['step']]);
    const chosen = retreat.legalRetreatPaths[0];

    const resolveRetreat: ResolveRetreatEvent = {
      effectType: 'resolveRetreat',
      eventType: 'gameEffect',
      path: chosen,
      unit: retreat.retreatingUnit,
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
      effectType: 'openReverseFromAttackApply',
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
      getPositionOfUnit(afterReverseOpen, reverse.reversingUnit),
    ).toStrictEqual({ coordinate: 'F-5', facing: 'north' });
  });
});
