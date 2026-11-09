import type { MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { getTurnedFacing } from '@queries';
import type { MoveState } from '../explore';
import type { PathTrace } from './pathTrace';
import { createMoveContext, getStepOption, getTurnOptions } from '../explore';
import { closeMovePath } from './closeMovePath';

/**
 * Judges a path a player submitted, delta by delta, under the same rules
 * the move search uses (§5–§6) — so a path is legal exactly when the search
 * could have found it. A turn must be one the rules allow from that point
 * (§5.2.1, §9.1.4); a step must be possible at all (§5.4); and the move must
 * be allowed to end where the path stops.
 *
 * A step into a space the move cannot go on from — an enemy, above all —
 * ends the move there, and what may follow is fixed: nothing, or the one
 * squaring turn of an oblique front approach (§6.2.3; `closeMovePath`).
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The moving unit and where it starts
 * @param path - The steps and turns the player submitted
 * @param direction - An ordered advance, or a forced retreat
 * @returns The ending the path reaches, or why the rules refuse it
 */
export function traceMovePath(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  path: readonly MoveDelta[],
  direction: 'advance' | 'retreat',
): PathTrace {
  // The budget is fixed where the move begins (§5.1.4).
  const context = createMoveContext(gameState, unitWithPlacement, direction);
  let state: MoveState = {
    cameFrom: context.start.coordinate,
    coordinate: context.start.coordinate,
    facing: context.start.facing,
    path: [],
    remainingFlexibility: context.totalFlexibility,
    remainingSpeed: context.totalSpeed,
  };

  for (const [index, delta] of path.entries()) {
    if (delta !== 'step') {
      // A turn must be one the rules allow from here, and paid for.
      if (!getTurnOptions(context, state).has(delta)) {
        const badTurn: PathTrace = {
          errorReason: `Move ${index + 1} (${delta}) is not a turn the unit may make there`,
          result: false,
        };
        return badTurn;
      }
      state = {
        ...state,
        facing: getTurnedFacing(state.facing, delta),
        path: [...state.path, delta],
        remainingFlexibility: state.remainingFlexibility - 1,
      };
      continue;
    }

    // A step must be possible at all: Speed left, on the board, through
    // the corners of a diagonal.
    const step = getStepOption(context, state);
    if (step === undefined) {
      const badStep: PathTrace = {
        errorReason: `Move ${index + 1} (step) is not a step the unit may take there`,
        result: false,
      };
      return badStep;
    }
    if (!step.mayContinue) {
      // The move stops in this space; only its ending remains to judge.
      const closed = closeMovePath(context, step.next, path.slice(index + 1));
      return closed;
    }
    state = step.next;
  }

  // The whole path walked on open or passable ground: it may stop here if
  // the ground allows it.
  const closed = closeMovePath(context, state, []);
  return closed;
}
