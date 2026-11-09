import type { MoveDelta, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { ValidationResult } from '@utils';
import { getLegalMoveDeltas } from '@legality';

/**
 * Whether a submitted path is a legal move (A11), checked the way every
 * player choice is: by membership against what `@legality` offers. Each
 * step or turn must be among the moves offered at that point in the path,
 * and the move must be allowed to stop where the path ends — which also
 * means an oblique front approach has written its squaring turn (§6.2.3).
 *
 * Never throws: a fault in the state comes back as a refusal with its
 * message.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The moving unit and where it starts
 * @param path - The steps and turns the player submitted
 * @param direction - An ordered advance, or a forced retreat
 * @returns Success, or the first move the rules refuse and why
 */
export function isValidMovePath(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  path: readonly MoveDelta[],
  direction: 'advance' | 'retreat',
): ValidationResult {
  try {
    // Every move must be one of those offered after the moves before it.
    for (const [index, delta] of path.entries()) {
      const offered = getLegalMoveDeltas(
        gameState,
        unitWithPlacement,
        path.slice(0, index),
        direction,
      );
      if (offered === undefined || !offered.next.has(delta)) {
        const refused: ValidationResult = {
          errorReason: `Move ${index + 1} (${delta}) is not one the unit may make there`,
          result: false,
        };
        return refused;
      }
    }

    // And the move must be allowed to stop where the path ends.
    const atEnd = getLegalMoveDeltas(
      gameState,
      unitWithPlacement,
      path,
      direction,
    );
    if (atEnd === undefined || !atEnd.mayStop) {
      const stillOwed = atEnd === undefined ? [] : [...atEnd.next];
      const cannotStop: ValidationResult = {
        errorReason:
          stillOwed.length === 0
            ? 'The move may not stop there'
            : `The move may not stop there; it may go on with ${stillOwed.join(' or ')}`,
        result: false,
      };
      return cannotStop;
    }

    const valid: ValidationResult = { result: true };
    return valid;
  } catch (error) {
    const fault: ValidationResult = {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
    return fault;
  }
}
