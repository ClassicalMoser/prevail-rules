import type { Modifier, MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { LegalMoveDeltas } from '@legality';
import type { ValidationResult } from '@utils';
import { findLegalMoveDeltas } from '@legality';
import { findIllegal, throwIfUndefined } from '@utils';

// TODO(composition): only isValidMoveUnitEvent calls this, always with
// 'advance'; a retreat is chosen from listed options (chooseRetreatOption), so
// 'retreat' is reached only from this function's spec. Settled by narrowing
// `direction` to the advance, or by a retreat being written as a path and
// checked here.
/**
 * Whether a submitted path is a legal move, checked the way every
 * player choice is: by membership against the legal options `@legality`
 * enumerates. Each step or turn must be among the moves enumerated at that
 * point in the path, and the move must be allowed to stop where the path
 * ends — which also means an oblique front approach has written its squaring
 * turn (§6.2.3).
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
  // asks about was enumerated move by move, so it is always a legal start,
  // and the throw below cannot be reached from a submitted path.
  const optionsAfter = (soFar: readonly MoveDelta[]): LegalMoveDeltas =>
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

  // Every move must be one of those enumerated after the moves before it, and
  // the move must be allowed to stop where the path ends.
  const refused = findIllegal(path, optionsAfter);

  // Every step and turn was offered, and the move may end there.
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  // A step or turn the unit could not make at that point: off the board,
  // into a space it may not enter, a turn it has no Flexibility for, or a
  // move past the point where it must stop. Counted from 1, as a player
  // reads their path.
  if (refused.refusal === 'notEnumerated') {
    const notEnumerated: ValidationResult = {
      errorReason: `Move ${refused.index + 1} (${path[refused.index]}) is not one the unit may make there`,
      result: false,
    };
    return notEnumerated;
  }

  // Every move was offered, but the unit may not end there: on a friend's
  // space it is only passing through (§5.3), short of the squaring turn a
  // front approach owes (§6.2.3), or, in a retreat, where it started
  // (§9.1.2). The refusal says what it could still go on with, if anything.
  const stillOwed = refused.options.next;
  const cannotStop: ValidationResult = {
    errorReason:
      stillOwed.length === 0
        ? 'The move may not stop there'
        : `The move may not stop there; it may go on with ${stillOwed.join(' or ')}`,
    result: false,
  };
  return cannotStop;
}
