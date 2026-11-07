import type { RoutState } from '@game';
import { isPending } from '@utils';

/**
 * Whether this rout is still waiting for its owner to choose cards.
 *
 * A rout owes a discard once the penalty is known and before the cards are
 * chosen. `resolveRout` fills the penalty in, so a rout whose count is still
 * pending has not reached the choice yet, and one already chosen or finished
 * has passed it.
 *
 * @param routState - The rout to ask about
 * @returns Whether a `chooseRoutDiscard` is still owed
 */
export function isAwaitingRoutDiscard(routState: RoutState): boolean {
  const penaltyKnown = !isPending(routState.numberToDiscard);
  const awaiting =
    penaltyKnown && !routState.cardsChosen && !routState.completed;
  return awaiting;
}
