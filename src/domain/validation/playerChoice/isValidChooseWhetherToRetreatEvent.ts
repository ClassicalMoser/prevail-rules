import type { ValidationResult } from '@utils';
import type { ChooseWhetherToRetreatEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseWhetherToRetreatEvents } from '@legality';

/**
 * Validates a ChooseWhetherToRetreatEvent by membership against
 * {@link getLegalChooseWhetherToRetreatEvents}.
 */
export function isValidChooseWhetherToRetreatEvent(
  event: ChooseWhetherToRetreatEvent,
  state: GameState,
): ValidationResult {
  // The defender of a front engagement, faster than the unit that walked
  // into it and with somewhere to go, may fall back or stand (§6.3.2).
  const legalOptions = getLegalChooseWhetherToRetreatEvents(state);

  // The answer is the defender's. Falling back is a "may", so both answers
  // are always offered (§1.2), and the comparison of the answer itself never
  // refuses; only the player can be wrong.
  const isLegal = legalOptions.some(
    (option) =>
      option.player === event.player &&
      option.choosesToRetreat === event.choosesToRetreat,
  );
  if (!isLegal) {
    // The unit that moved in has no say: its player answering is refused.
    const notDefender: ValidationResult = {
      errorReason: `Choose whether to retreat is not legal for ${event.player}`,
      result: false,
    };
    return notDefender;
  }

  // The defender's answer, either way.
  const valid: ValidationResult = { result: true };
  return valid;
}
