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
  // The positions held on the way differ from route to route (§5.2.4), and
  // that does not upset this: a way on that the earlier route's held
  // positions forbid comes back to one of them, where that route stood
  // sooner with more left, so the ending is found from there. The space each
  // route last stepped from differs too, but it is read only where an
  // engagement is judged, and the walk never goes on from an enemy's space.
  const arrivals = new Map<string, { speed: number; flexibility: number }[]>();

  // Whether the caller has what it wanted. Once it has, nothing more is
  // walked: `findEndingFrom` needs only one ending to know a move can be
  // finished.
  let stopped = false;
  const report = (ending: MoveResult): void => {
    if (onEnding(ending)) {
      stopped = true;
    }
  };

  // One point of the move: report it if the move may stop there, then go on
  // by every turn and the step the rules allow.
  const walk = (state: MoveState): void => {
    // The caller already has its answer.
    if (stopped) {
      return;
    }

    // TODO(composition): `getSmallestMovePerEnding` writes the same
    // space-and-facing key for a placement. One reader of that key would
    // keep the two from drifting apart.
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
      const turned = getTurnedState(state, turn);
      walk(turned);
    }

    // Or step, if a step can be taken.
    const step = getStepOption(context, state);
    // No step from here: the board edge, a held position, a shut diagonal
    // or no Speed left. Turns were the only ways on.
    if (step === undefined) {
      return;
    }
    // A space it may pass through, the move goes on from.
    if (step.mayContinue) {
      walk(step.next);
      // Everything from that space is walked; this point has no more ways on.
      return;
    }
    // A space it may not pass through, the move can only stop in.
    const stoppingEnding = findMoveEnding(context, step.next);
    if (stoppingEnding !== undefined) {
      report(stoppingEnding);
    }
  };

  // Every ending reachable from the given point, found by walking on from it.
  walk(from);
}
