import type { Modifier, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { MoveResult } from './moveResult';
import { createMoveContext } from './createMoveContext';
import { getStartState } from './getStartState';
import { walkMoveEndings } from './walkMoveEndings';

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
 * (`findMoveEnding`). Advances and forced retreats walk the same way; a
 * retreat's extra limits are carried in its context.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The unit and its starting position
 * @param direction - The direction of movement: 'advance' or 'retreat'
 * @param commitmentModifiers - What a card committed for this move adds (§8), if one was
 * @returns Every legal ending, with the Speed and Flexibility it costs
 */
export function exploreUnitMoves(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  direction: 'advance' | 'retreat',
  commitmentModifiers?: Modifier[],
): Set<MoveResult> {
  const context = createMoveContext(
    gameState,
    unitWithPlacement,
    direction,
    commitmentModifiers,
  );
  const results = new Set<MoveResult>();
  walkMoveEndings(context, getStartState(context), (ending) => {
    results.add(ending);
    return false;
  });
  return results;
}
