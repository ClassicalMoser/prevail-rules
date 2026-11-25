import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import {
  createChooseMeleeResolutionEvent,
  createEmptyGameState,
} from '@factories';
import {
  createPlayCardsPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { isValidChooseMeleeResolutionEvent } from './isValidMeleeResolutionEvent';

/**
 * Phase 4 between melees, with black holding the initiative and these
 * engaged spaces still to fight.
 */
function stateWithRemaining(remaining: readonly Coordinate[]): GameState {
  // Black is the first player, who picks the order (§4.4.2).
  const base = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  // No melee is under way; these are the engagements not yet fought.
  const phase = createResolveMeleePhaseState(base, {
    currentMeleeResolutionState: 'pending',
    remainingEngagements: [...remaining],
  });
  const between = updatePhaseState(base, phase);
  return between;
}

/**
 * IsValidChooseMeleeResolutionEvent: membership against getLegalChooseMeleeResolutionEvents.
 */
describe('isValidChooseMeleeResolutionEvent function', () => {
  it('accepts a remaining engagement for the initiative player', () => {
    const state = stateWithRemaining(['E-5', 'E-6']);
    const event = createChooseMeleeResolutionEvent({
      player: 'black',
      space: 'E-5',
    });

    // Either remaining space may come first; black names one.
    expect(isValidChooseMeleeResolutionEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a space that is not among remaining engagements', () => {
    const state = stateWithRemaining(['E-5']);
    const event = createChooseMeleeResolutionEvent({
      player: 'black',
      space: 'E-6',
    });

    // E-6 has no fight waiting, so it cannot be chosen.
    expect(isValidChooseMeleeResolutionEvent(event, state)).toStrictEqual({
      errorReason: 'Space E-6 is not a legal melee resolution choice for black',
      result: false,
    });
  });

  it('refuses the second player choosing which melee is fought next', () => {
    // The space is a real one still to fight, but the order is the first
    // player's to choose (§4.4.2), and white does not hold the initiative.
    const state = stateWithRemaining(['E-5']);
    const event = createChooseMeleeResolutionEvent({
      player: 'white',
      space: 'E-5',
    });

    expect(isValidChooseMeleeResolutionEvent(event, state)).toStrictEqual({
      errorReason: 'Space E-5 is not a legal melee resolution choice for white',
      result: false,
    });
  });

  it('throws, naming the phase, when the game is not resolving melee', () => {
    // Phase 1: cards are being chosen, and no melee is in question.
    const state = updatePhaseState(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      createPlayCardsPhaseState(),
    );
    const event = createChooseMeleeResolutionEvent({
      player: 'black',
      space: 'E-5',
    });

    // Choosing the next engagement belongs to the melee phase.
    expect(() => isValidChooseMeleeResolutionEvent(event, state)).toThrow(
      'Expected resolveMelee phase, got playCards',
    );
  });
});
