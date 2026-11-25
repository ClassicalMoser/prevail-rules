import type { ValidationResult } from '@utils';
import type { ChooseRallyEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseRallyEvent } from '@legality';

/**
 * Validates whether a ChooseRallyEvent is among the legal choose-rally options
 * for the current game state.
 *
 * @param event - The choose rally event to validate
 * @param state - The current game state
 * @returns ValidationResult indicating if the event is valid
 */
export function isValidChooseRallyEvent(
  event: ChooseRallyEvent,
  state: GameState,
): ValidationResult {
  // The answers open to the player whose turn it is to decide whether to
  // rally, first player first (§10.3.1): declining always, rallying only
  // with a played card to burn (§10.3.2).
  const legalOptions = getLegalChooseRallyEvent(state);

  // The answer must come from that player, and be one they may give.
  const isLegal = legalOptions.some(
    (option) =>
      option.player === event.player &&
      option.performRally === event.performRally,
  );
  if (!isLegal) {
    // The other player answering out of turn, or a rally with nothing to
    // burn.
    const notLegal: ValidationResult = {
      errorReason: `Choose rally option is not legal for ${event.player}`,
      result: false,
    };
    return notLegal;
  }

  // An answer the deciding player may give.
  const valid: ValidationResult = { result: true };
  return valid;
}
