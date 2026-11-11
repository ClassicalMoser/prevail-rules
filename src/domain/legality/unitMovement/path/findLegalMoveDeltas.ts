import type { Modifier, MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { LegalMoveDeltas } from './legalMoveDeltas';
import {
  createMoveContext,
  findMoveEnding,
  getStepOption,
  getTurnOptions,
} from '../explore';
import { followMovePrefix } from './followMovePrefix';

/**
 * The moves a player may make next, given the path written so far:
 * the turns the rules allow from here (§5.2.1, §9.1.4), a step if one can be
 * taken, and whether the move may stop here instead. Once the move has
 * entered a space it cannot go on from, all that remains is its squaring
 * turn, if it owes one (§6.2.3).
 *
 * This is the one-move-at-a-time offering of a move: a client asks it at
 * each point, and the validator checks every submitted move against it.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The moving unit and where it starts
 * @param prefix - The moves written so far
 * @param direction - An ordered advance, or a forced retreat
 * @param commitmentModifiers - What a card committed for this move adds (§4.3.10), if one was
 * @returns What may come next, or `undefined` when the moves so far are not a legal start to a move
 */
export function findLegalMoveDeltas(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  prefix: readonly MoveDelta[],
  direction: 'advance' | 'retreat',
  commitmentModifiers?: Modifier[],
): LegalMoveDeltas | undefined {
  const context = createMoveContext(
    gameState,
    unitWithPlacement,
    direction,
    commitmentModifiers,
  );
  const position = followMovePrefix(context, prefix);
  if (position === undefined) {
    return undefined;
  }

  // The move has stopped: only the moves it still owes may follow, and it
  // may stop once they are made.
  if (position.closing !== undefined) {
    const owed: LegalMoveDeltas = {
      mayStop: position.closing.length === 0,
      next: new Set(position.closing.slice(0, 1)),
    };
    return owed;
  }

  // Under way: any turn the rules allow, and a step if the unit can take it
  // and then either go on or end there.
  const { state } = position;
  const next = new Set<MoveDelta>(getTurnOptions(context, state));
  const step = getStepOption(context, state);
  if (
    step !== undefined &&
    (step.mayContinue || findMoveEnding(context, step.next) !== undefined)
  ) {
    next.add('step');
  }

  const offered: LegalMoveDeltas = {
    mayStop: findMoveEnding(context, state) !== undefined,
    next,
  };
  return offered;
}
