import type { UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { MoveResult } from './moveResult';
import type { MoveState } from './moveState';
import { createMoveContext } from './createMoveContext';
import { getMoveEnding } from './getMoveEnding';
import { getStepOption } from './getStepOption';
import { getTurnOptions } from './getTurnOptions';
import { getTurnedState } from './getTurnedState';

/**
 * Every placement a unit's move may legally end on. From any point in a
 * move a unit can do only two things: step 1 Speed into the space it faces,
 * or spend 1 Flexibility to turn 45° either way or about (§5.1–§5.2). Turns
 * and steps come in any order and may repeat (§5.2.2), so this walks both
 * from every point until the two allowances run out, collecting each place
 * the move may stop.
 *
 * The rules themselves live beside it, one to a file: what a move is bound
 * by (`createMoveContext`), the turns and the step open from a point
 * (`getTurnOptions`, `getStepOption`), and whether the move may end there
 * (`getMoveEnding`). Advances and forced retreats walk the same way; a
 * retreat's extra limits are carried in its context.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The unit and its starting position
 * @param direction - The direction of movement: 'advance' or 'retreat'
 * @returns Every legal ending, with the Speed and Flexibility it costs
 */
export function exploreUnitMoves(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  direction: 'advance' | 'retreat',
): Set<MoveResult> {
  const context = createMoveContext(gameState, unitWithPlacement, direction);
  const results = new Set<MoveResult>();

  // Points are keyed with the allowances still unspent: the same placement
  // reached with more left over is a genuinely different prospect, because
  // there is more move to spend from it. The space the last step left is
  // not in the key, because a move never continues out of an enemy's
  // space — the only place that origin matters.
  const visited = new Set<string>();

  const explore = (state: MoveState): void => {
    const key = `${state.coordinate}|${state.facing}|${state.remainingSpeed}|${state.remainingFlexibility}`;
    if (visited.has(key)) {
      return;
    }
    visited.add(key);

    // The move may stop here, if the rules allow it.
    const ending = getMoveEnding(context, state);
    if (ending !== undefined) {
      results.add(ending);
    }

    // Or it may turn, for a point of Flexibility each.
    for (const turn of getTurnOptions(context, state)) {
      explore(getTurnedState(state, turn));
    }

    // Or it may step, for a point of Speed.
    const step = getStepOption(context, state);
    if (step === undefined) {
      return;
    }
    if (step.mayContinue) {
      explore(step.next);
      return;
    }
    // A space the move cannot go on from may still be where it ends — an
    // enemy to engage, above all — so it is judged as an ending only.
    const stoppingEnding = getMoveEnding(context, step.next);
    if (stoppingEnding !== undefined) {
      results.add(stoppingEnding);
    }
  };

  const start: MoveState = {
    cameFrom: context.start.coordinate,
    coordinate: context.start.coordinate,
    facing: context.start.facing,
    path: [],
    remainingFlexibility: context.totalFlexibility,
    remainingSpeed: context.totalSpeed,
  };
  explore(start);

  return results;
}
