import type { GameState, RetreatState } from '@game';
import { isNone, isPending } from '@utils';
import { hasInitiative } from '@queries/player';
import { isFriendlyUnit } from '@queries/unit';
import { isOpenSubstep } from '../isOpenSubstep';

/**
 * The retreat this player is making, or `undefined` when they are not
 * retreating.
 *
 * Three places hold a retreat: the apply on a ranged attack, a front engagement
 * the defender gave ground to, and either side's apply in a melee. Which one is
 * live follows from the phase and the command being resolved.
 *
 * Not retreating is an ordinary state, so this reads each slot's own sentinel
 * rather than asking a getter that would throw. Callers that know a retreat
 * must be there use `getRetreatState`.
 *
 * @param state - The game state
 * @param player - The player whose retreat to find
 * @returns That player's retreat, or `undefined` when they have none
 */
export function findRetreatState(
  state: GameState,
  player: 'white' | 'black',
): RetreatState | undefined {
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
      return rangedRetreat;
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
    return frontRetreat;
  }

  if (phaseState.phase === 'resolveMelee') {
    const melee = phaseState.currentMeleeResolutionState;
    if (isPending(melee)) {
      return undefined;
    }
    // The slots are named for the order they resolve in, so the owner has to
    // be placed in that order first.
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
    return meleeRetreat;
  }

  // No other phase moves a unit by retreat.
  return undefined;
}
