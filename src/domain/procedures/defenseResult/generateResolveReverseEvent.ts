import type { Board } from '@entities';
import type { ResolveReverseEvent } from '@events';
import type { GameState, ReverseState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  MELEE_ATTACK_RESOLUTION_CONTEXT,
  RANGED_ATTACK_RESOLUTION_CONTEXT,
  RESOLVE_REVERSE_EFFECT_TYPE,
} from '@events';
import {
  getAttackApplyStateFromRangedAttack,
  getCurrentPhaseState,
  getOppositeFacing,
  getReverseStateFromAttackApply,
  getReverseStateFromMeleeResolutionByInitiative,
} from '@queries';

/**
 * Generates a ResolveReverseEvent by calculating the new facing
 * (opposite of current facing) for a unit that is being reversed.
 *
 * @param state - The current game state
 * @returns A complete ResolveReverseEvent with the reversed unit placement
 * @throws Error if not in a valid state for reverse resolution
 */
export function generateResolveReverseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
  eventNumber: number,
): ResolveReverseEvent<TBoard, 'resolveReverse'> {
  const phaseState = getCurrentPhaseState(state);

  let reverseState: ReverseState;

  if (phaseState.phase === 'issueCommands') {
    reverseState = getReverseStateFromAttackApply(
      getAttackApplyStateFromRangedAttack(state),
    );
  } else if (phaseState.phase === 'resolveMelee') {
    reverseState = getReverseStateFromMeleeResolutionByInitiative(state);
  } else {
    throw new Error(
      `Reverse resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  const currentFacing = reverseState.reversingUnit.placement.facing;
  const newFacing = getOppositeFacing(currentFacing);

  const attackResolutionContext =
    phaseState.phase === 'issueCommands'
      ? RANGED_ATTACK_RESOLUTION_CONTEXT
      : MELEE_ATTACK_RESOLUTION_CONTEXT;

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_REVERSE_EFFECT_TYPE,
    attackResolutionContext,
    eventNumber,
    boardType: reverseState.boardType,
    unitInstance: reverseState.reversingUnit,
    newUnitPlacement: {
      boardType: reverseState.reversingUnit.boardType,
      unit: reverseState.reversingUnit.unit,
      placement: {
        boardType: reverseState.reversingUnit.placement.boardType,
        coordinate: reverseState.reversingUnit.placement.coordinate,
        facing: newFacing,
      },
    },
  } as unknown as ResolveReverseEvent<TBoard, 'resolveReverse'>;
}
