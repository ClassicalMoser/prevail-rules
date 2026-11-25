import type { ValidationResult } from '@utils';
import type { ChooseMeleeResolutionEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseMeleeResolutionEvents } from '@legality';

// TODO(misleading): the file is `isValidMeleeResolutionEvent` but its export,
// and the choice it judges (`chooseMeleeResolution`), carry "choose". Settled
// by renaming the file `isValidChooseMeleeResolutionEvent.ts`, like its
// siblings.

/**
 * Validates whether a choose melee resolution event is among the legal options
 * for the current game state.
 *
 * In Phase 4 every engaged space fights, and the first player picks which one
 * is fought next (§4.4.2). The order matters because a unit routed in one
 * fight no longer supports the next (§7.3.3).
 *
 * @param event - The choose melee resolution event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidChooseMeleeResolutionEvent(
  event: ChooseMeleeResolutionEvent,
  state: GameState,
): ValidationResult {
  // One option per engagement still to fight, each the first player's.
  // Asked outside the phase's fighting step, mid-melee, or with nothing left
  // to fight, the enumerator throws; the expected check refuses such a choice
  // first.
  const legalOptions = getLegalChooseMeleeResolutionEvents(state);

  // The choice is legal when the first player names a space still waiting to
  // fight. The second player has no say in the order, and a space already
  // fought, or never engaged, is not on the list.
  const isLegal = legalOptions.some(
    (option) => option.player === event.player && option.space === event.space,
  );
  if (!isLegal) {
    const illegal: ValidationResult = {
      errorReason: `Space ${event.space} is not a legal melee resolution choice for ${event.player}`,
      result: false,
    };
    return illegal;
  }

  // The first player has chosen an engagement still to be fought.
  const valid: ValidationResult = { result: true };
  return valid;
}
