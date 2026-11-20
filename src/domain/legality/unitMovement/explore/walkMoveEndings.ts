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
  // What the walk has had left on reaching each position, a space and a
  // facing. From one position the move can go on the same ways whatever
  // route led there; only what is left to spend differs. An arrival with no
  // more Speed and no more Flexibility than an earlier one there can reach
  // nothing the earlier one could not, and at no lower cost, so it is not
  // walked again. An arrival with more of either is.
  const arrivals = new Map<string, { speed: number; flexibility: number }[]>();
  let stopped = false;
  const report = (ending: MoveResult): void => {
    if (onEnding(ending)) {
      stopped = true;
    }
  };
  const walk = (state: MoveState): void => {
    if (stopped) {
      return;
    }

    // An arrival no better than one already walked from here finds nothing
    // new.
    const position = `${state.coordinate}|${state.facing}`;
    const speed = state.remainingSpeed;
    const flexibility = state.remainingFlexibility;
    const before = arrivals.get(position) ?? [];
    const outdone = before.some(
      (earlier) => earlier.speed >= speed && earlier.flexibility >= flexibility,
    );
    if (outdone) {
      return;
    }

    // Remember this arrival, and forget any it outdoes: they can no longer
    // turn a later arrival away that this one would not.
    const kept = before.filter(
      (earlier) => earlier.speed > speed || earlier.flexibility > flexibility,
    );
    arrivals.set(position, [...kept, { flexibility, speed }]);

    // The move may stop here, if the ending rules allow it.
    const ending = findMoveEnding(context, state);
    if (ending !== undefined) {
      report(ending);
    }

    // Or turn on the spot, each way the rules allow, and go on from there.
    for (const turn of getTurnOptions(context, state)) {
      walk(getTurnedState(state, turn));
    }

    // Or step, if a step can be taken.
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
