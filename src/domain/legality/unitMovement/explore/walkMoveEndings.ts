import type { MoveContext } from './moveContext';
import type { MoveResult } from './moveResult';
import type { MoveState } from './moveState';
import { findMoveEnding } from './findMoveEnding';
import { getStepOption } from './getStepOption';
import { getTurnOptions } from './getTurnOptions';
import { getTurnedState } from './getTurnedState';

/**
 * Walks every way a move may go on from a point, steps and turns in any order
 * (§5.2.2), until the Speed and Flexibility run out, and hands each place the
 * move may legally end to `onEnding`. The walk stops as soon as `onEnding`
 * answers `true`, so a caller that wants only to know whether the move can be
 * finished need not find them all.
 *
 * This is the one walk of a move. The list of every ending
 * (`exploreUnitMoves`) and the look-ahead that keeps a move offered a part at
 * a time from leading into a dead end (`findEndingFrom`) both use it, so the
 * two cannot disagree about where a move may stop.
 *
 * @param context - What the whole move is bound by
 * @param from - The point to walk on from
 * @param onEnding - Told of each legal ending; answers `true` to stop the walk
 */
export function walkMoveEndings(
  context: MoveContext,
  from: MoveState,
  onEnding: (ending: MoveResult) => boolean,
): void {
  const visited = new Set<string>();
  let stopped = false;
  const report = (ending: MoveResult): void => {
    if (onEnding(ending)) {
      stopped = true;
    }
  };
  const walk = (state: MoveState): void => {
    // Reaching the same point twice by different routes finds nothing new.
    const key = `${state.coordinate}|${state.facing}|${state.remainingSpeed}|${state.remainingFlexibility}`;
    if (stopped || visited.has(key)) {
      return;
    }
    visited.add(key);
    const ending = findMoveEnding(context, state);
    if (ending !== undefined) {
      report(ending);
    }
    for (const turn of getTurnOptions(context, state)) {
      walk(getTurnedState(state, turn));
    }
    const step = getStepOption(context, state);
    if (step === undefined) {
      return;
    }
    // A space it may pass through, the move goes on from.
    if (step.mayContinue) {
      walk(step.next);
      return;
    }
    // A space it may not pass through, the move can only stop in.
    const stoppingEnding = findMoveEnding(context, step.next);
    if (stoppingEnding !== undefined) {
      report(stoppingEnding);
    }
  };
  walk(from);
}
