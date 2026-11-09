import type { MoveDelta } from '@entities';
import type { MoveContext, MoveState } from '../explore';
import type { PathTrace } from './pathTrace';
import { getMoveEnding } from '../explore';

/**
 * Judges the end of a submitted path: whether the move may stop where it
 * stands, and whether what the player wrote after arriving matches what
 * the rules require there. That is nothing at all, except for an oblique
 * front approach to an enemy, which must end with the one squaring turn
 * that faces it head-on (§6.2.3) — written into the path, so the event
 * records the whole motion.
 *
 * @param context - What the whole move is bound by
 * @param arrived - The point the move stops at, before any squaring turn
 * @param rest - Whatever the path still holds after arriving
 * @returns The ending the move reaches, or why the rules refuse it
 */
export function closeMovePath(
  context: MoveContext,
  arrived: MoveState,
  rest: readonly MoveDelta[],
): PathTrace {
  // May the move stop here at all (§5.3, §6.2, §9.1.2)?
  const ending = getMoveEnding(context, arrived);
  if (ending === undefined) {
    const cannotEnd: PathTrace = {
      errorReason: `The move may not end on ${arrived.coordinate} facing ${arrived.facing}`,
      result: false,
    };
    return cannotEnd;
  }

  // The ending's own path is the arrival plus whatever the rules add: the
  // squaring turn, or nothing. The submitted remainder must be exactly that.
  const required = ending.path.slice(arrived.path.length);
  const matches =
    rest.length === required.length &&
    rest.every((delta, index) => delta === required[index]);
  if (!matches) {
    const wrongClose: PathTrace = {
      errorReason:
        required.length === 0
          ? `The move ends on ${arrived.coordinate} and cannot go on`
          : `Closing on ${arrived.coordinate} from the front must end with ${required.join(', ')}`,
      result: false,
    };
    return wrongClose;
  }

  const reached: PathTrace = { ending, result: true };
  return reached;
}
