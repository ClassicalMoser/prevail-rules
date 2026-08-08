import type { ChooseRetreatOptionEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import type { GameState, RetreatState } from '@game';
import { findRetreatState, getNextEventNumber } from '@queries';

/**
 * Finds a retreat substep that is awaiting a player choice of retreat option
 * (finalPosition still pending, at least one legal option). Soft: returns null
 * when none is active under the current phase context.
 */
function findAwaitingRetreatOptionChoice<S extends GameState>(
  gameState: S,
): RetreatState | null {
  for (const player of ['black', 'white'] as const) {
    try {
      const retreatState = findRetreatState(gameState, player);
      if (
        !retreatState.completed &&
        retreatState.finalPosition === 'pending' &&
        retreatState.legalRetreatOptions.length > 0
      ) {
        return retreatState;
      }
    } catch {
      // No retreat for this player in the current phase context.
    }
  }
  return null;
}

/**
 * Returns every legal choose-retreat-option event for an active retreat substep
 * awaiting `finalPosition`: one {@link ChooseRetreatOptionEvent} per entry in
 * `legalRetreatOptions`.
 *
 * Returns `[]` when no such retreat choice is expected (wrong phase context,
 * already chosen, or no options). Does not recompute retreat geometry —
 * options are taken from the retreat substep (baked in when the substep opened).
 *
 * Aligns with {@link isValidChooseRetreatOptionEvent} and
 * {@link getExpectedRetreatEvent} for the multi-option pending branch.
 */
export function getLegalChooseRetreatOptionEvents<S extends GameState>(
  gameState: S,
): ChooseRetreatOptionEvent[] {
  const retreatState = findAwaitingRetreatOptionChoice(gameState);
  if (retreatState === null) {
    return [];
  }

  const eventNumber = getNextEventNumber(gameState);
  const player = retreatState.retreatingUnit.unit.playerSide;

  return retreatState.legalRetreatOptions.map((retreatOption) => ({
    choiceType: 'chooseRetreatOption',
    eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player,
    retreatOption,
  }));
}
