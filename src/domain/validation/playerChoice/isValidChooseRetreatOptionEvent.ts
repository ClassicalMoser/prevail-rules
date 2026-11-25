import type { ValidationResult } from '@utils';
import type { ChooseRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import { getLegalChooseRetreatOptionEvents } from '@legality';
import { isSameMovePath } from '@queries';

// TODO(misleading): "Empty options → not legal" describes a case that no
// longer arises. `getLegalChooseRetreatOptionEvents` throws when no retreat
// awaits a choice, and `findRetreatAwaitingChoice` answers only a retreat
// with at least one path, so the options are never empty. Settled by
// dropping that sentence.
/**
 * Validates a ChooseRetreatOptionEvent by membership against
 * {@link getLegalChooseRetreatOptionEvents}: the path must be one of the
 * retreats offered (§9.1.3). Empty options → not legal.
 */
export function isValidChooseRetreatOptionEvent(
  event: ChooseRetreatOptionEvent,
  state: GameState,
): ValidationResult {
  // The equally small retreats the unit may make, worked out when its
  // retreat opened; its owner chooses among them (§9.1.3).
  const legalOptions = getLegalChooseRetreatOptionEvents(state);

  // The choice is the retreating unit's owner's, whoever drove it back, and
  // names one of those retreats by its path, step for step and turn for turn.
  const isLegal = legalOptions.some(
    (option) =>
      option.player === event.player && isSameMovePath(option.path, event.path),
  );
  if (!isLegal) {
    // A path that is not one of the smallest retreats, or a choice from the
    // player whose unit is not retreating: a retreat is no free repositioning
    // (§9.1.3).
    const notOffered: ValidationResult = {
      errorReason: `Retreat path ${event.path.join(', ')} is not one offered to ${event.player}`,
      result: false,
    };
    return notOffered;
  }

  // One of the retreats offered, chosen by the unit's owner.
  const valid: ValidationResult = { result: true };
  return valid;
}
