import type { MoveDelta } from '@entities';
import type { MoveContext } from '../explore';
import type { MovePosition } from './movePosition';
import {
  findMoveEnding,
  getStartState,
  getStepOption,
  getTurnedState,
  getTurnOptions,
} from '../explore';

/**
 * Follows the first moves of a path through the movement rules, to find
 * where they leave the move — so the next moves can be offered from there.
 * Each turn must be one the rules allow (§5.2.1, §9.1.4) and each step one
 * the unit can take (§5.4). A step into a space the move cannot go on from
 * stops the move, and from then on only the closing moves the rules require
 * may follow.
 *
 * @param context - What the whole move is bound by
 * @param prefix - The moves written so far
 * @returns Where they leave the move, or `undefined` if they are not a legal start to one
 */
export function followMovePrefix(
  context: MoveContext,
  prefix: readonly MoveDelta[],
): MovePosition | undefined {
  let state = getStartState(context);
  let closing: readonly MoveDelta[] | undefined;

  for (const delta of prefix) {
    // Once the move has stopped, only its closing moves may follow, in order.
    if (closing !== undefined) {
      if (closing[0] !== delta) {
        return undefined;
      }
      closing = closing.slice(1);
      continue;
    }

    // A turn must be one the rules allow from here.
    if (delta !== 'step') {
      if (!getTurnOptions(context, state).has(delta)) {
        return undefined;
      }
      state = getTurnedState(state, delta);
      continue;
    }

    // A step must be one the unit can take.
    const step = getStepOption(context, state);
    if (step === undefined) {
      return undefined;
    }
    state = step.next;
    // Into a space it cannot go on from: the move stops, and its ending
    // fixes what must follow — the squaring turn, or nothing.
    if (!step.mayContinue) {
      const ending = findMoveEnding(context, state);
      if (ending === undefined) {
        return undefined;
      }
      closing = ending.path.slice(state.path.length);
    }
  }

  const position: MovePosition = { closing, state };
  return position;
}
