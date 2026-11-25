import type { ResolveReverseEvent } from '@events';
import type { GameState, ReverseState } from '@game';
import {
  getAttackApplyStateOfPlayer,
  getPositionOfUnit,
  getReverseStateFromAttackApply,
} from '@queries';
import { throwIfBypassed } from '@utils';
import {
  moveUnitOnBoard,
  updateReverseState,
} from '@transforms/pureTransforms';

// TODO(misleading): the header says the facing is updated "to the opposite
// direction". The apply writes whatever facing the event carries, and the
// procedure leaves it unchanged for a unit still engaged (§7.5.5). Settle by
// rewording the header to say the unit takes the event's facing.
/**
 * Applies a ResolveReverseEvent to the game state.
 * Updates the unit's facing to the opposite direction and marks the reverse state as completed.
 *
 * @param event - The resolve reverse event to apply
 * @param state - The current game state
 * @returns A new game state with the unit's facing updated and reverse state marked as completed
 * @throws Error when the attack on the unit's owner applied no reverse
 */
export function applyResolveReverseEvent<S extends GameState>(
  event: ResolveReverseEvent,
  state: S,
): S {
  // The unit turns about where it stands, to the facing the procedure worked out.
  // A reverse is not a move (§9.2.2): it keeps its space, wherever a retreat
  // before it left the unit, and only its facing changes.
  const standing = getPositionOfUnit(state, event.unit);
  const turned = moveUnitOnBoard(state, event.unit, {
    coordinate: standing.coordinate,
    facing: event.facing,
  });

  // The attack whose results the unit is taking: the shot's one apply, or
  // in a melee the apply on its owner's side.
  const attackApplyState = getAttackApplyStateOfPlayer(
    state,
    event.unit.playerSide,
  );

  // The reverse this event resolves. An attack that did not reach the unit's
  // Reverse has none, and resolving one then is a fault in the sequence.
  // TODO(composition): this walk is repeated inside `updateReverseState`,
  // and there is no `getReverseState(state, player)` as there is for retreats
  // and routs. Settled by that reader in `@queries`, or by a transform that
  // completes the open reverse itself.
  const currentReverseState = throwIfBypassed(
    getReverseStateFromAttackApply(attackApplyState),
    'This attack apply applied no reverse to resolve',
  );

  // Turned or not, the reverse has been carried out and is owed nothing more.
  const newReverseState: ReverseState = {
    ...currentReverseState,
    completed: true,
  };

  // The game with the unit facing its new way and the reverse closed, so the
  // rout stage can follow.
  const reversed = updateReverseState(turned, newReverseState);
  return reversed;
}
