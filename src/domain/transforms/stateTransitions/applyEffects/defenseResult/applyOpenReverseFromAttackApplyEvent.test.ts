import type { OpenReverseFromAttackApplyEvent } from '@events';
import { createAttackApplyState } from '@factories';
import { getRangedAttackReverseState } from '@queries';
import {
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';

import { applyOpenReverseFromAttackApplyEvent } from './applyOpenReverseFromAttackApplyEvent';

/**
 * Opens the reverse under an attack apply whose reverse slot is still pending.
 * The unit is held by identity.
 */
describe('applyOpenReverseFromAttackApplyEvent function', () => {
  it('opens a reverse holding the defending unit by identity', () => {
    // White's unit on E-5 facing north, shot by Black's shooter in front of
    // it. Any unit will do: the apply reads nothing of it but who it is.
    const target = createTestUnit('white');
    const shooter = createTestUnit('black', { range: 1 });
    const base = createGameStateWithUnits([
      placed(target, 'E-5', 'north'),
      placed(shooter, 'D-5', 'south'),
    ]);

    // The shot reached the target's Reverse and nothing else, so the
    // reverse is due and unopened.
    const apply = createAttackApplyState(target, {
      unitRetreated: false,
      unitReversed: true,
      unitRouted: false,
    });
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: apply,
      attackingUnit: shooter,
      defendingUnit: target,
    });
    const state = createGameStateResolvingCommand(shot, base);

    // The event carries nothing; the state names the apply.
    const event: OpenReverseFromAttackApplyEvent = {
      effectType: 'openReverseFromAttackApply',
      eventType: 'gameEffect',
    };
    const next = applyOpenReverseFromAttackApplyEvent(event, state);

    // The reverse is open, unfinished, and names the target itself; where it
    // stands is read from the board when the reverse resolves.
    const reverse = getRangedAttackReverseState(next);
    expect(reverse.substepType).toBe('reverse');
    expect(reverse.completed).toBe(false);
    expect(reverse.reversingUnit).toBe(target);
  });
});
