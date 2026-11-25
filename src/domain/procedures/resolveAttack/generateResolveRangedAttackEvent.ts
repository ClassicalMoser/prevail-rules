import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
} from '@events';
import type { ResolveRangedAttackEvent } from '@events';
import { isResolved, throwIfPending } from '@utils';
import {
  applyAttackValue,
  getRawUnitStat,
  getRangedAttackResolutionState,
  modifiersFromCompletedCommitment,
} from '@queries';
/**
 * Generates a ResolveRangedAttackEvent by calculating the attack value
 * and determining the results (routed, reversed, retreated).
 *
 * Attack value calculation:
 * - Base attack stat
 * - + Support bonuses (from supportingUnits in state)
 * - + CommandCard modifiers (from committed cards)
 * - + Active card modifiers (if unit was commanded)
 *
 * TODO(misleading): the list leaves out the round effect of the shooter's card
 * in play (§7.1.2 item 1), which `getRawUnitStat` adds as well, and the
 * target's own card raising its thresholds (§7.1.5). Settle by listing them,
 * as the melee sibling's header lists the round effect.
 *
 * @param state - The current game state
 * @returns A complete ResolveRangedAttackEvent with the defending unit and results
 * @throws Error if not in a valid state for ranged attack resolution
 */
export function generateResolveRangedAttackEvent(
  state: GameState,
): ResolveRangedAttackEvent {
  // The shot under way; asking outside a Shoot order throws there.
  const rangedAttackState = getRangedAttackResolutionState(state);

  // TODO(composition): the three guards below are the shot's twin of
  // `getMeleeResolutionReadyForAttackCalculation`, which the melee sibling
  // asks, written inline here. A ranged reader beside it in @queries
  // sequencing would settle it, and give the target and supporters below one
  // place to be narrowed.

  // Both commitments must be resolved before calculating attack
  // The shooter commits before it aims, and the target's owner after the
  // target is named (§4.3.11 steps 2 and 5, §7.4.5); the shot is measured
  // only once both have committed a card or declined.
  if (rangedAttackState.attackingCommitment.commitmentType === 'pending') {
    throw new Error('Attacking commitment is still pending');
  }

  if (rangedAttackState.defendingCommitment.commitmentType === 'pending') {
    throw new Error('Defending commitment is still pending');
  }

  // Attack apply state should not exist yet (this procedure creates it)
  // A shot is measured once; its result is already written if the apply is.
  if (isResolved(rangedAttackState.attackApplyState)) {
    throw new Error('Attack apply state already exists');
  }

  // The shooter, named first (§4.3.11 step 1).
  const { attackingUnit } = rangedAttackState;

  // The target and supporters are named before the target's owner commits
  // (§4.3.11 steps 3–5), and that commitment is complete, so they are
  // written by now.
  const defendingUnit = throwIfPending(
    rangedAttackState.defendingUnit,
    'The target of the shot has not been named',
  );
  // TODO(composition): play writes the target and supporters together, before
  // the defending commitment checked above, so these two throws are reached
  // only from a state play cannot build. Settled with the ranged reader in
  // the mark above.
  const supportingUnits = throwIfPending(
    rangedAttackState.supportingUnits,
    'The supporters of the shot have not been named',
  );

  // The shooter's one committed card counts for the whole shot (§7.4.5): an
  // Attack card adds to the blow; a Range card was already spent reaching
  // the target, and does nothing here.
  const attackingCommitmentModifiers = modifiersFromCompletedCommitment(
    rangedAttackState.attackingCommitment,
  );

  // The shooter's Attack, summed raw: support is added to it and the whole
  // is floored once, when it lands (§7.1.4).
  const baseAttackValue = getRawUnitStat(
    attackingUnit,
    'attack',
    state,
    attackingCommitmentModifiers,
  );

  // Each supporting unit provides 1 support value. Simple as that.
  // Ranged support is flat, whatever the supporter's facing or position, and
  // each supporter spent its own shot to give it (§7.3.4, §7.4.3).
  const supportValue = supportingUnits.length;

  // Add the base attack value and the support value to get the total attack value
  // The finished attack value is floored at zero when it lands, in
  // `applyAttackValue` (§7.1.4).
  const totalAttackValue = baseAttackValue + supportValue;

  // The target's owner may have committed a card for Defence, raising all
  // three of its thresholds against this shot (§4.3.11 step 5, §8.5). The
  // shot is one way (§7.4.4), so this card never adds to an attack.
  const defendingCommitmentModifiers = modifiersFromCompletedCommitment(
    rangedAttackState.defendingCommitment,
  );

  // Apply attack value to determine results.
  // Defensive commitment modifiers are applied to the defending unit.
  const attackResult = applyAttackValue(
    state,
    totalAttackValue,
    defendingUnit,
    defendingCommitmentModifiers,
  );

  // Legal retreat hexes are computed when the retreat opens, not on this event.
  // TODO(misleading): "hexes" — the board is square spaces (§2.1.1). Settle by
  // saying "spaces", or "retreats" as `getLegalRetreats` does.
  // The event records only what the shot reached; the target is the one the
  // shot holds, and the transform writes its apply from this result.
  const resolved: ResolveRangedAttackEvent = {
    attackResult,
    effectType: RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The shot's result, for the transform to write and carry out in turn.
  return resolved;
}
