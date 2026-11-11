import type { ChooseRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import { findRetreatAwaitingChoice } from '@queries';
import { createChooseRetreatOptionEvent } from '@factories';

/**
 * Returns every legal choose-retreat-option event for an active retreat substep
 * awaiting its `chosenRetreatPath`: one {@link ChooseRetreatOptionEvent} per entry in
 * `legalRetreatPaths`.
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
  // The retreat whose owner has a choice still to make (§9.1.3), if any.
  const awaiting = findRetreatAwaitingChoice(gameState);
  if (awaiting === undefined) {
    return [];
  }
  const { retreatState } = awaiting;

  const player = retreatState.retreatingUnit.unit.playerSide;

  // Each offered retreat is chosen by naming its path.
  const choices = retreatState.legalRetreatPaths.map((path) =>
    createChooseRetreatOptionEvent({
      path: [...path],
      player,
    }),
  );
  return choices;
}
