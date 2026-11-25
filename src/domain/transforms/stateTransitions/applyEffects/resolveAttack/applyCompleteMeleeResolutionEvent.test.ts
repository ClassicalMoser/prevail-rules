import type { CompleteMeleeResolutionEvent } from '@events';
import { getResolveMeleePhaseState } from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createGameStateWithEngagedUnits,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCompleteMeleeResolutionEvent } from './applyCompleteMeleeResolutionEvent';

/**
 * One melee hex is fully resolved: drop `currentMeleeResolutionState` so the phase can pick
 * the next engagement or eventually complete the resolve-melee phase.
 */
describe('applyCompleteMeleeResolutionEvent function', () => {
  const event: CompleteMeleeResolutionEvent = {
    effectType: 'completeMeleeResolution',
    eventType: 'gameEffect',
  };

  it('clears the melee just fought, so the first player may choose the next (§4.4.2)', () => {
    // White's and Black's units fought on E-5; neither blow reached a
    // threshold, so both stay, locked, to fight again next round (§7.2.3).
    // White holds the initiative, so its unit's apply is the first player's.
    const white = createTestUnit('white');
    const black = createTestUnit('black', { attack: 2 });
    const base = createGameStateWithEngagedUnits(white, black, 'E-5');
    const melee = createMeleeResolutionState(base, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithNothingDue(
        white,
        { completed: true },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithNothingDue(
        black,
        { completed: true },
      ),
    });
    const fought = updatePhaseState(
      base,
      createResolveMeleePhaseState(base, {
        currentMeleeResolutionState: melee,
      }),
    );

    const next = applyCompleteMeleeResolutionEvent(event, fought);

    // No melee is under way, and Phase 4 goes on.
    expect(getResolveMeleePhaseState(next)).toMatchObject({
      currentMeleeResolutionState: 'pending',
      step: 'resolveMelee',
    });
  });
});
