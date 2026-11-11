import type { ChooseRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import { findRetreatAwaitingChoice } from '@queries';
import { createChooseRetreatOptionEvent } from '@factories';

/**
 * Returns every legal choose-retreat-option event for an active retreat substep
 * awaiting its `chosenRetreatPath`: one {@link ChooseRetreatOptionEvent} per entry in
 * `legalRetreatPaths`.
 *
 * Nothing asks unless a retreat awaits its owner's choice, so being asked
 * then is the caller's mistake and throws. Does not recompute retreat
 * geometry — options are taken from the retreat substep (baked in when the
 * substep opened).
 *
 * Aligns with {@link isValidChooseRetreatOptionEvent} and
 * {@link getExpectedRetreatEvent} for the multi-option pending branch.
 *
 * @throws Error when no retreat is awaiting its owner's choice of destination
 */
export function getLegalChooseRetreatOptionEvents<S extends GameState>(
  gameState: S,
): ChooseRetreatOptionEvent[] {
  // The retreat whose owner has a choice still to make (§9.1.3), if any.
  const awaiting = findRetreatAwaitingChoice(gameState);
  if (awaiting === undefined) {
    throw new Error('No retreat is awaiting its owner’s choice of destination');
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
