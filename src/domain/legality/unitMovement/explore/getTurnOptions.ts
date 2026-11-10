import type { MoveTurn } from '@entities';
import type { MoveContext } from './moveContext';
import type { MoveState } from './moveState';

/** Every turn the rules know: 45° either way, or about (§5.2.1). */
const everyTurn: readonly MoveTurn[] = ['turnLeft', 'turnRight', 'turnAbout'];

/** A retreat's turns: 45° either way, never about (§9.1.4). */
const retreatTurns: readonly MoveTurn[] = ['turnLeft', 'turnRight'];

/**
 * The turns a unit may make from this point in its move, each for
 * 1 Flexibility. Ordinarily that is 45° to its left or right, or about
 * (§5.2.1), as often as the allowance lasts (§5.2.2).
 *
 * A retreat is the exception (§9.1.4). It never turns about: a unit forced
 * back does not reverse to face the other way. And before its first step
 * back it may turn at most 45° in all. After the first step it turns 45°
 * either way, as often as its Flexibility lasts.
 *
 * @param context - What the whole move is bound by
 * @param state - The point in the move the turn would be made from
 * @returns The turns allowed from here; empty when no turn is allowed
 */
export function getTurnOptions(
  context: MoveContext,
  state: MoveState,
): Set<MoveTurn> {
  // Every turn costs a point; with none left, the unit holds its facing.
  if (state.remainingFlexibility === 0) {
    const none = new Set<MoveTurn>();
    return none;
  }

  // An advance turns by the ordinary rule.
  if (context.direction !== 'retreat') {
    const ordinary = new Set(everyTurn);
    return ordinary;
  }

  // A retreat that has stepped back turns 45° either way, never about.
  const hasSteppedBack = state.coordinate !== context.start.coordinate;
  if (hasSteppedBack) {
    const retreating = new Set(retreatTurns);
    return retreating;
  }

  // The opening allows 45° in all, so once the facing has left the one the
  // retreat began with, that allowance is spent: a second turn would stack
  // to 90°, or swing straight back.
  if (state.facing !== context.start.facing) {
    const spent = new Set<MoveTurn>();
    return spent;
  }
  const opening = new Set(retreatTurns);
  return opening;
}
