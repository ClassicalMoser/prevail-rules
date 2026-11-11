import type { Modifier, MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { LegalMoveDeltas } from '@legality';
import type { ValidationResult } from '@utils';
import { findLegalMoveDeltas } from '@legality';
import { findRefusedPart, throwIfUndefined } from '@utils';

/**
 * Whether a submitted path is a legal move, checked the way every
 * player choice is: by membership against what `@legality` offers. Each
 * step or turn must be among the moves offered at that point in the path,
 * and the move must be allowed to stop where the path ends — which also
 * means an oblique front approach has written its squaring turn (§6.2.3).
 *
 * A fault in the state throws here, where it is found, and
 * `validatePlayerChoice` turns it into a refusal with its message.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The moving unit and where it starts
 * @param path - The steps and turns the player submitted
 * @param direction - An ordered advance, or a forced retreat
 * @param commitmentModifiers - What a card committed for this move adds (§4.3.10), if one was
 * @returns Success, or the first move the rules refuse and why
 */
export function isValidMovePath(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  path: readonly MoveDelta[],
  direction: 'advance' | 'retreat',
  commitmentModifiers?: Modifier[],
): ValidationResult {
  // What may follow a run of moves already accepted. Every run the walk
  // asks about was offered move by move, so it is always a legal start.
  const offerAfter = (soFar: readonly MoveDelta[]): LegalMoveDeltas =>
    throwIfUndefined(
      findLegalMoveDeltas(
        gameState,
        unitWithPlacement,
        soFar,
        direction,
        commitmentModifiers,
      ),
      'A path accepted move by move is not a legal start to a move',
    );

  // Every move must be one of those offered after the moves before it, and
  // the move must be allowed to stop where the path ends.
  const refused = findRefusedPart(path, offerAfter);
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  if (refused.refusal === 'notOffered') {
    const notOffered: ValidationResult = {
      errorReason: `Move ${refused.index + 1} (${path[refused.index]}) is not one the unit may make there`,
      result: false,
    };
    return notOffered;
  }

  const stillOwed = refused.offered.next;
  const cannotStop: ValidationResult = {
    errorReason:
      stillOwed.length === 0
        ? 'The move may not stop there'
        : `The move may not stop there; it may go on with ${stillOwed.join(' or ')}`,
    result: false,
  };
  return cannotStop;
}
