import type { AttackResolutionContext } from '@events';
import type { GameState, RetreatState } from '@game';
import { isNone, isPending } from '@utils';
import { hasInitiative } from '@queries/player';
import { isFriendlyUnit } from '@queries/unit';
import { isOpenSubstep } from '../isOpenSubstep';

/** The parent a retreat is held by: an attack's apply, or a front engagement. */
export type RetreatSource = AttackResolutionContext | 'frontEngagement';

/**
 * A retreat and the parent holding it.
 *
 * The parent is part of the answer: a retreat a front engagement gave ground
 * to closes that engagement when it is done, and one an attack forced does
 * not, so a caller finishing a retreat has to know which it holds.
 */
export interface RetreatLocation {
  /** The open retreat. */
  retreatState: RetreatState;
  /** The parent holding it. */
  source: RetreatSource;
}

/**
 * The retreat this player is making and the parent holding it, or
 * `undefined` when they are not retreating.
 *
 * Three places hold a retreat: the apply on a ranged attack, a front engagement
 * the defender gave ground to, and either side's apply in a melee. Which one is
 * live follows from the phase and the command being resolved.
 *
 * Not retreating is an ordinary state, so this reads each slot's own sentinel
 * rather than asking a getter that would throw. Callers that want the retreat
 * without its parent use `findRetreatState`, and those that know a retreat
 * must be there use `getRetreatState`.
 *
 * @param state - The game state
 * @param player - The player whose retreat to find
 * @returns That player's retreat and its parent, or `undefined` when they have none
 */
export function findRetreatLocation(
  state: GameState,
  player: 'white' | 'black',
): RetreatLocation | undefined {
  // Setup has no phase yet, and asking before the round starts is fair.
  const phaseState = state.currentRoundState.currentPhaseState;
  if (isNone(phaseState)) {
    return undefined;
  }

  if (phaseState.phase === 'issueCommands') {
    const commandResolution = phaseState.currentCommandResolutionState;
    // Between commands nobody is retreating.
    if (isPending(commandResolution)) {
      return undefined;
    }

    if (commandResolution.commandResolutionType === 'rangedAttack') {
      const apply = commandResolution.attackApplyState;
      if (isPending(apply)) {
        return undefined;
      }
      const rangedRetreat = apply.retreatState;
      if (!isOpenSubstep(rangedRetreat)) {
        return undefined;
      }
      // The defender of a ranged attack may be either player's unit.
      if (!isFriendlyUnit(rangedRetreat.retreatingUnit.unit, player)) {
        return undefined;
      }
      const rangedLocation = {
        retreatState: rangedRetreat,
        source: 'rangedAttack' as const,
      };
      return rangedLocation;
    }

    // A movement forces a retreat only when it engages from the front and the
    // defender gives ground rather than holding.
    const engagement = commandResolution.engagementState;
    if (isPending(engagement)) {
      return undefined;
    }
    const resolution = engagement.engagementResolutionState;
    if (resolution.engagementType !== 'front') {
      return undefined;
    }
    const frontRetreat = resolution.retreatState;
    if (isPending(frontRetreat)) {
      return undefined;
    }
    if (!isFriendlyUnit(frontRetreat.retreatingUnit.unit, player)) {
      return undefined;
    }
    const frontLocation = {
      retreatState: frontRetreat,
      source: 'frontEngagement' as const,
    };
    return frontLocation;
  }

  if (phaseState.phase === 'resolveMelee') {
    const melee = phaseState.currentMeleeResolutionState;
    if (isPending(melee)) {
      return undefined;
    }
    // The slots are named for whose unit holds the result, so the owner
    // picks the slot.
    const sideApply = hasInitiative(state, player)
      ? melee.firstPlayerAttackApplyState
      : melee.secondPlayerAttackApplyState;
    if (isPending(sideApply)) {
      return undefined;
    }
    const meleeRetreat = sideApply.retreatState;
    if (!isOpenSubstep(meleeRetreat)) {
      return undefined;
    }
    const meleeLocation = {
      retreatState: meleeRetreat,
      source: 'melee' as const,
    };
    return meleeLocation;
  }

  // No other phase moves a unit by retreat.
  return undefined;
}
