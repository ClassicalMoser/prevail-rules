import type { Modifier, MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { LegalMoveDeltas } from './legalMoveDeltas';
import {
  createMoveContext,
  findEndingFrom,
  findMoveEnding,
  getStepOption,
  getTurnedState,
  getTurnOptions,
} from '../explore';
import { followMovePrefix } from './followMovePrefix';

/**
 * The moves a player may make next, given the path written so far:
 * the turns the rules allow from here (§5.2.1, §9.1.4), a step if one can be
 * taken, and whether the move may stop here instead. A part is offered only
 * if the move can still be finished after it. Once the move has
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
      next: position.closing.slice(0, 1),
    };
    return owed;
  }

  // Under way: any turn the rules allow, and a step if the unit can take it
  // and then either go on or end there.
  const { state } = position;
  // A part is offered only if the move can still be finished after it: a
  // player led into a point with no legal ending could never complete the
  // move, and the list of every ending would never have shown it to them.
  const next = new Set<MoveDelta>();
  for (const turn of getTurnOptions(context, state)) {
    if (findEndingFrom(context, getTurnedState(state, turn)) !== undefined) {
      next.add(turn);
    }
  }
  const step = getStepOption(context, state);
  if (step !== undefined) {
    // A space the unit may pass through leaves the move open, so look on from
    // it; one it may not pass through is only an ending.
    const finishable = step.mayContinue
      ? findEndingFrom(context, step.next) !== undefined
      : findMoveEnding(context, step.next) !== undefined;
    if (finishable) {
      next.add('step');
    }
  }
  const offered: LegalMoveDeltas = {
    mayStop: findMoveEnding(context, state) !== undefined,
    next: [...next],
  };
  return offered;
}
