import type { Modifier, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { MoveContext } from './moveContext';
import { getCurrentUnitStat, getSpacesBehind } from '@queries';

/**
 * Settles the context a move is bound by, at the moment the move begins.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The unit and its starting position
 * @param direction - The direction of movement: 'advance' or 'retreat'
 * @param commitmentModifiers - What a card committed for this move adds (§8), if one was
 * @returns The context every step and turn of the move is judged in
 * @throws Error when the direction is neither 'advance' nor 'retreat'
 */
export function createMoveContext(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  direction: 'advance' | 'retreat',
  commitmentModifiers?: Modifier[],
): MoveContext {
  // The type names the two directions, but a caller outside the type system
  // (a test, a wire payload) still gets a clear fault rather than a walk
  // that silently explores nothing.
  // TODO(misleading): no wire payload reaches this. Every caller in the repo
  // passes a literal: 'advance' from `getLegalUnitMoves` and
  // `isValidMoveUnitEvent`, 'retreat' from `getLegalRetreats`. And a third
  // value would not explore nothing: it would walk as a retreat that may
  // turn about. So the type already rules the guard out. Settled by the
  // author deciding whether it stays for untyped callers of the package, or
  // goes with its spec cases.
  if (direction !== 'advance' && direction !== 'retreat') {
    throw new Error('Invalid direction');
  }

  // The unit's own stats set the budget, and where it stands is where every
  // rule that looks back to the start of the move looks: standing still, a
  // rear engagement's region (§6.2.2), the retreat's region (§9.1.2).
  const { placement: start, unit } = unitWithPlacement;

  // The move's whole budget is sampled here, once, where the move begins
  // (§5.1.4): a round effect's reach is read from the start space and is
  // neither lost nor gained by where the unit walks.
  // A card committed before the move adds to it (§4.3.10, §8).
  // Terrain is not read yet (RULEBOOK appendix A3). When it is, a move's
  // Speed depends on the worst ground its path touches (§5.5.1), so the
  // Speed can no longer be settled here once for the whole move.
  const totalSpeed = getCurrentUnitStat(
    unit,
    'speed',
    gameState,
    commitmentModifiers,
  );
  const totalFlexibility = getCurrentUnitStat(
    unit,
    'flexibility',
    gameState,
    commitmentModifiers,
  );

  // The retreat region is computed for advances too; it is cheap, and an
  // advance simply never consults it.
  const retreatSpaces = getSpacesBehind(
    gameState.boardState,
    start.coordinate,
    start.facing,
  );

  // The unit's side decides who may be passed through and who engaged
  // (§5.4); everything else here is settled above.
  const context: MoveContext = {
    direction,
    gameState,
    retreatSpaces,
    start,
    totalFlexibility,
    totalSpeed,
    unitSide: unit.playerSide,
  };

  // Every step and turn of the move is judged against this one value.
  return context;
}
